var Formats = require('./data/formats');
var States = require('./data/states');

function simplifyState(input) {
    if (input == undefined) {
        return false;
    } else {
        return input.replace(/[^a-z]/gi, "").toLowerCase();
    }
}

function simplifyCounty(input) {
    if (input == undefined) {
        return false;
    } else {
        var county = input.replace(/[^a-z]/gi, "").toLowerCase();
        if (county.match(/county$/gi)) {
            county = county.replace(/county$/gi, "");
        }
        return county.trim();
    }
}

module.exports = {
    verifyState: function(state) {
        if (state.length === 2) {
            for (item in States) {
                if (States.hasOwnProperty(item)) {
                    if (item === state) {
                        return item;
                    }
                }
            }
        } else {
            for (item in States) {
                if (States[item].replace(" ", "") === state) {
                    return item;
                }
            }
        }
        throw state + " is not a valid state name.";
    },
    lookup: function(state, county) {
        state = simplifyState(state);
        modifiedCounty = simplifyCounty(county);
        console.log('state', state, 'county', county)
        if (state) {
            state = this.verifyState(state);
            if (modifiedCounty) {
                for (co in Formats[state]) {
                    if (Formats[state].hasOwnProperty(co)) {
                        if (co.replace(" ", "") === modifiedCounty) {
                            return Formats[state][co]["formats"];
                        }
                    }
                }
                throw county + " is not a valid county name.";
            } else {
                var data = {};
                for (section in Formats[state]) {
                    if (Formats[state].hasOwnProperty(section)) {
                        data[section] = Formats[state][section].formats;
                    }
                }
                return data;
            }
        } else {
            for (st in Formats) {
                if (Formats.hasOwnProperty(st)) {
                    for (co in Formats[st]) {
                        if (Formats[st].hasOwnProperty(co)) {
                            delete Formats[st][co].regex;
                            delete Formats[st][co].fips;
                        }
                    }
                }
            }
            return Formats;
        }
    },
    validate: function(apn_input, state, county) {
        if (apn_input) {
            if (state) {
                state = this.verifyState(simplifyState(state));
                county = simplifyCounty(county);
                try {
                    patterns = Formats[state][county].regex;
                } catch (err) {
                    throw county + " is not a valid county name for state: " + state;
                }
                for (var i = 0; i < patterns.length; i++) {
                    if (apn_input.search(patterns[i]) !== -1) {
                        return true;
                    }
                }
                return false;
            } else {
                throw "No state given";
            }
        }
        throw "No APN value given";
    },
    format: function(apn_input, state, county) {
        try {
            var validate = this.validate(apn_input, state, county);
            if (validate) {
                return apn_input;
            }
        } catch (_) {}

        if (!state || !county) {
            throw "No state or county given";
        }

        var formats = this.lookup(state, county);
        if (!formats) {
            throw "No formats found for " + simplifyCounty(county) + ", " + simplifyState(state);
        }

        // X: number
        // A: letter
        // S: space
        // we can also ignore any trailing zeros if they don't match

        // example 325938293 -> XXX-XXX-XXX -> 325-938-293
        // example 325938293000000 -> XXX-XXX-XXX -> 325-938-293
        // example 123456789S -> XXX-XX-XXXS -> 123-45-678S
        // example N23456789 -> SXX:XX.XXX -> N23:45.678

        var apn = apn_input;

        // pad APN with zeroes if necessary
        if (apn.length < 12) {
            apn = apn.padEnd(12, "0");
        }
        
        function format_apn(apn, format) {
            var formatted = "";
            var apn_index = 0;
            var format_index = 0;

            // console.log('format', format, 'apn', apn)

            // go through each format and see if it matches
            while (apn_index < apn.length) {
                var format_char = format[format_index];
                var apn_char = apn[apn_index];

                // console.log('format_char -> apn_char', format_char, '->', apn_char)

                if (format_char === undefined && apn_char !== "0") {
                    return null;
                }

                if (format_char === "X") {
                    if (!isNaN(parseInt(apn_char))) {
                        formatted += apn_char;
                        apn_index++;
                    } else {
                        return null
                    }
                } else if (format_char === "A") {
                    if (format_char.match(/[a-z]/i)) {
                        formatted += apn_char;
                        apn_index++;
                    } else {
                        return null
                    }
                } else if (format_char === "S") {
                    if (apn_char === " ") {
                        formatted += apn_char;
                        apn_index++;
                    } else {
                        return null
                    }
                } else if (apn_char === "0" && format_char === undefined) {
                    apn_index++;
                } else {
                    formatted += format_char;
                    // apn_index++;
                }

                format_index++;
            }

            format_index = 0;

            return formatted;
        }

        for (var format of formats) {
            var formatted_apn = format_apn(apn, format);
            if (formatted_apn) {
                return formatted_apn;
            }
        }

        return null
    }
}
