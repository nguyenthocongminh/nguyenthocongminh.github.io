const js_helper_lib = (function () {
    const param = (function () {
        const isIE = function() {
            let ua = window.navigator.userAgent;
            let msie = ua.indexOf("MSIE ");

            if (msie > -1 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
                // If Internet Explorer, return true
                // version = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)))
                return true;
            }

            // If another browser, return false
            return false;
        };

        const parse_query_string = function(query) {
            let query_string = {};
            if (query) {
                let vars = query.split("&");
                for (let i = 0; i < vars.length; i++) {
                    let pair = vars[i].split("=");
                    let key = decodeURIComponent(pair[0]);
                    let value = decodeURIComponent(pair[1]);
                    // If first entry with this name
                    if (typeof query_string[key] === "undefined") {
                        query_string[key] = decodeURIComponent(value);
                        // If second entry with this name
                    } else if (typeof query_string[key] === "string") {
                        query_string[key] = [query_string[key], decodeURIComponent(value)];
                        // If third or later entry with this name
                    } else {
                        query_string[key].push(decodeURIComponent(value));
                    }
                }
            }
            return query_string;
        };

        const getParam = function(name="") {
            if (isIE()) {
                let query = window.location.search.substring(1);
                let parsed_qs = parse_query_string(query);
                return name?((parsed_qs[name] === undefined)?"":parsed_qs[name]):parsed_qs;
            }
            let url = new URL(window.location.href);
            if (name) {
                let request_param = url.searchParams.get(name);
                if ((Array.isArray(request_param) || request_param.length !== undefined) && request_param.length > 0) {
                    if (request_param.length === 1) {
                        return request_param[0];
                    }
                    return request_param;
                }
                return "";
            }
            let parsed_qs = {};
            url.searchParams.forEach(function(value, key) {
                if (parsed_qs[key] === undefined) {
                    parsed_qs[key] = value;
                } else {
                    let tmp = parsed_qs[key];
                    parsed_qs[key] = [];
                    parsed_qs[key].push(tmp);
                    parsed_qs[key].push(value);
                }
            });
            return parsed_qs;
        };

        return {
            get: function (name="") {
                return getParam(name);
            },
        }
    })();

    return {
        param: param,
    }
})();
