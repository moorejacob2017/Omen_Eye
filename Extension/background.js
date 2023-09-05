class DataManager {
    constructor() {
        this.urls = new Set();
        this.headers = {}; // { url: { headerName: Set } }
        this.postBodies = {}; // { url: rawRequestBody }
        this.postParameters = {}; // { url: { paramName: Set } }
        this.inputs = {}; // { url: { inputName: Set } }
        this.queryParameters = {}; // { url: { paramName: Set } }
        this.inputTags = {}; // { url: Set }
        this.links = {}; // { url: Set }

        this.isActive = false; // Flag to determine if data should be collected

        this.scopeSwitch = false;
        this.scopeRegex = ''; // to store regex for collection scope
        this.filterSwitch = false;
        this.filterRegex = '';
        this.outputFilterSwitch = false;
        this.outputFilterRegex = '';


    }

    clear() {
        this.urls.clear();

        this.headers = {};
        this.postBodies = {};
        this.postParameters = {};
        this.inputs = {};
        this.queryParameters = {};
        this.inputTags = {};
        this.links = {}; // { url: Set }
    }

    export() {
        const data = {
            urls: [...this.urls],
            headers: this.setsToArrays(this.headers),
            postBodies: this.setsToArrays(this.postBodies),
            postParameters: this.setsToArrays(this.postParameters),
            inputs: this.setsToArrays(this.inputs),
            queryParameters: this.setsToArrays(this.queryParameters),
            inputTags: this.setsToArrays(this.inputTags),
            links: this.setsToArrays(this.links)
        };
        return JSON.stringify(data);
    }

    import(jsonStr) {
        const data = JSON.parse(jsonStr);
    
        this.urls = new Set(data.urls);
        this.headers = this.arraysToSets(data.headers);
        this.postBodies = this.arraysToSets(data.postBodies);
        this.postParameters = this.arraysToSets(data.postParameters);
        this.inputs = this.arraysToSets(data.inputs);
        this.queryParameters = this.arraysToSets(data.queryParameters);
        this.inputTags = this.arraysToSets(data.inputTags);
        this.links = this.arraysToSets(data.links);
    }

    setsToArrays(obj) {
        const result = {};
        for (let key in obj) {
            if (obj[key] instanceof Set) {
                result[key] = [...obj[key]];
            } else if (typeof obj[key] === 'object') {
                result[key] = this.setsToArrays(obj[key]);
            } else {
                result[key] = obj[key];
            }
        }
        return result;
    }

    arraysToSets(obj) {
        const result = {};
        for (let key in obj) {
            if (Array.isArray(obj[key])) {
                result[key] = new Set(obj[key]);
            } else if (typeof obj[key] === 'object') {
                result[key] = this.arraysToSets(obj[key]);
            } else {
                result[key] = obj[key];
            }
        }
        return result;
    }

    matchesCollectionScope(url) {
        if (this.scopeSwitch) {
            if (RegExp(this.scopeRegex).test(url)) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
        // If no scope regex is set, default to matching all URLs
    }

    outputFilter(stringsArray) {
        if (this.outputFilterSwitch) {
            const regex = new RegExp(this.outputFilterRegex);
            return stringsArray.filter(str => regex.test(str)).sort();
        }
        return stringsArray.sort();
    }

    //-------------------------------------------------------------------------
    // Adders

    addURL(url) {
        this.urls.add(url);

        // Extract the query parameters
        const urlObj = new URL(url);
        for (const [paramName, paramValue] of urlObj.searchParams) {
            this.addQueryParameter(url, paramName, paramValue);
        }
    }

    addHeader(url, name, value) {
        if (!this.headers[url]) {
            this.headers[url] = {};
        }
        if (!this.headers[url][name]) {
            this.headers[url][name] = new Set();
        }
        this.headers[url][name].add(value);
    }

    addPostBody(url, postBody) {
        if (!this.postBodies[url]) {
            this.postBodies[url] = new Set();
        }
        this.postBodies[url].add(postBody);
    }

    addPostParameter(url, paramName, paramValue) {
        if (!this.postParameters[url]) {
            this.postParameters[url] = {};
        }
        if (!this.postParameters[url][paramName]) {
            this.postParameters[url][paramName] = new Set();
        }
        this.postParameters[url][paramName].add(paramValue);
    }

    addInput(url, inputName, inputValue) {
        if (inputName && inputName.trim() !== '') {
            if (!this.inputs[url]) {
                this.inputs[url] = {};
            }
            if (!this.inputs[url][inputName]) {
                this.inputs[url][inputName] = new Set();
            }
            if (inputValue && inputValue.trim() !== '') {
                this.inputs[url][inputName].add(inputValue);
            }
        }
    }

    addQueryParameter(url, paramName, paramValue) {
        if (!this.queryParameters[url]) {
            this.queryParameters[url] = {};
        }
        if (!this.queryParameters[url][paramName]) {
            this.queryParameters[url][paramName] = new Set();
        }
        this.queryParameters[url][paramName].add(paramValue);
    }

    addInputTag(url, tag) {
        if (!this.inputTags[url]) {
            this.inputTags[url] = new Set();
        }
        this.inputTags[url].add(tag);
    }

    addFormData(url, formData) {
        if(this.matchesCollectionScope(url)) {
            formData.forEach(input => {
                const { name, value, type, tag } = input;
                
                // Add the input name and value
                this.addInput(url, name, value);

                // If you want to handle the input tags separately, you can add them as well
                this.addInputTag(url, tag);
            });
        }
    }

    addLinks(url, linksArray) {
        if (!this.links[url]) {
            this.links[url] = new Set();
        }
        for (const link of linksArray) {
            this.links[url].add(link);
        }
    }

    //-------------------------------------------------------------------------
    // Getters

    getAllURLs() {
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            return [...this.urls].filter(url => regex.test(url));
        }
        return [...this.urls];
    }

    getAllLinks() {
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            return [...new Set(Object.entries(this.links).filter(([url]) => regex.test(url)).flatMap(([, linkSet]) => [...linkSet]))];
        } else {
            return [...new Set(Object.values(this.links).flatMap(linkSet => [...linkSet]))];
        }
    }

    getAllHeaders() {
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            return [...new Set(Object.values(this.headers).filter(headerObj => regex.test(headerObj)).flatMap(headerObj => Object.keys(headerObj)))];
        } else {
            return [...new Set(Object.values(this.headers).flatMap(headerObj => Object.keys(headerObj)))];
        }
    }

    getAllHeaderValues() {
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            return [...new Set(Object.entries(this.headers).filter(([url]) => regex.test(url)).flatMap(([, headerObj]) => Object.values(headerObj).flatMap(set => [...set])))];
        } else {
            return [...new Set(Object.values(this.headers).flatMap(headerObj => Object.values(headerObj).flatMap(set => [...set])))];
        }
    }

    getAllPostBodies() {
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            return [
                ...new Set(
                    Object.entries(this.postBodies)
                        .filter(([url, _]) => regex.test(url))
                        .flatMap(([, postBodySet]) => [...postBodySet])
                )
            ];
        } else {
            return [...new Set(Object.values(this.postBodies).flatMap(postBodySet => [...postBodySet]))];
        }
    }    

    getAllPostParameters() {
        const parameterNamesSet = new Set();
    
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
    
            Object.entries(this.postParameters)
                .filter(([url, _]) => regex.test(url))
                .forEach(([_, params]) => {
                    Object.keys(params).forEach(name => {
                        parameterNamesSet.add(name);
                    });
                });
        } else {
            Object.values(this.postParameters).forEach(params => {
                Object.keys(params).forEach(name => {
                    parameterNamesSet.add(name);
                });
            });
        }
        
        return Array.from(parameterNamesSet);
    }

    getAllPostParametersValues() {
        const postParameterValuesSet = new Set();
    
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
    
            Object.entries(this.postParameters)
                .filter(([url, _]) => regex.test(url))
                .forEach(([_, params]) => {
                    Object.values(params).forEach(paramValuesSet => {
                        [...paramValuesSet].forEach(value => {
                            postParameterValuesSet.add(value);
                        });
                    });
                });
        } else {
            Object.values(this.postParameters).forEach(params => {
                Object.values(params).forEach(paramValuesSet => {
                    [...paramValuesSet].forEach(value => {
                        postParameterValuesSet.add(value);
                    });
                });
            });
        }
        
        return [...postParameterValuesSet];
    }

    getAllInputs() {
        const inputsSet = new Set();
    
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
    
            Object.entries(this.inputs)
                .filter(([url, _]) => regex.test(url))
                .forEach(([_, input]) => {
                    Object.keys(input).forEach(inputName => {
                        inputsSet.add(inputName);
                    });
                });
        } else {
            Object.values(this.inputs).forEach(input => {
                Object.keys(input).forEach(inputName => {
                    inputsSet.add(inputName);
                });
            });
        }
        
        return [...inputsSet];
    }

    getAllInputValues() {
        const inputValuesSet = new Set();
    
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
    
            Object.entries(this.inputs)
                .filter(([url, _]) => regex.test(url))
                .forEach(([_, input]) => {
                    Object.values(input).forEach(inputValueSet => {
                        [...inputValueSet].forEach(value => {
                            inputValuesSet.add(value);
                        });
                    });
                });
        } else {
            Object.values(this.inputs).forEach(input => {
                Object.values(input).forEach(inputValueSet => {
                    [...inputValueSet].forEach(value => {
                        inputValuesSet.add(value);
                    });
                });
            });
        }
        
        return [...inputValuesSet];
    }

    getAllQueryParameters() {
        const queryParametersSet = new Set();
    
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
    
            Object.entries(this.queryParameters)
                .filter(([url, _]) => regex.test(url))
                .forEach(([_, params]) => {
                    Object.keys(params).forEach(paramName => {
                        queryParametersSet.add(paramName);
                    });
                });
        } else {
            Object.values(this.queryParameters).forEach(params => {
                Object.keys(params).forEach(paramName => {
                    queryParametersSet.add(paramName);
                });
            });
        }
    
        return [...queryParametersSet];
    }

    getAllQueryParametersValues() {
        const queryParameterValuesSet = new Set();
    
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
    
            Object.entries(this.queryParameters)
                .filter(([url, _]) => regex.test(url))
                .forEach(([_, params]) => {
                    Object.values(params).forEach(paramValuesSet => {
                        [...paramValuesSet].forEach(value => {
                            queryParameterValuesSet.add(value);
                        });
                    });
                });
        } else {
            Object.values(this.queryParameters).forEach(params => {
                Object.values(params).forEach(paramValuesSet => {
                    [...paramValuesSet].forEach(value => {
                        queryParameterValuesSet.add(value);
                    });
                });
            });
        }
    
        return [...queryParameterValuesSet];
    }
    
    getAllInputTags() {
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            return [
                ...new Set(
                    Object.entries(this.inputTags)
                        .filter(([url, _]) => regex.test(url))
                        .flatMap(([, tagSet]) => [...tagSet])
                )
            ];
        } else {
            return [...new Set(Object.values(this.inputTags).flatMap(set => [...set]))];
        }
    }

    //-----------------------------------------------------------------------
    // PAIRS

    getInputValuePairs() {
        const pairs = [];
        const regex = new RegExp(this.filterRegex);
    
        for (const url in this.inputs) {
            if (this.filterSwitch && !regex.test(url)) {
                continue; // Skip this URL if it doesn't match the filter
            }
    
            for (const inputName in this.inputs[url]) {
                const values = this.inputs[url][inputName];
                if (values.size > 0) {
                    // If there are values, add them as separate pairs
                    for (const value of values) {
                        pairs.push(`${inputName}=${value}`);
                    }
                } else {
                    // If there are no values, add just the input name
                    pairs.push(`${inputName}=`);
                }
            }
        }
    
        // Return a de-duplicated array
        return [...new Set(pairs)];
    }
    
    getHeaderValuePairs() {
        const headerPairsSet = new Set();
        const regex = new RegExp(this.filterRegex);

        for (const url in this.headers) {
            if (this.filterSwitch && !regex.test(url)) continue;
            for (const headerName in this.headers[url]) {
                for (const value of this.headers[url][headerName]) {
                    headerPairsSet.add(`${headerName}: ${value}`);
                }
            }
        }
        return [...headerPairsSet];
    }

    getPostParameterValuePairs() {
        const postParameterPairsSet = new Set();
        const regex = new RegExp(this.filterRegex);
    
        for (const url in this.postParameters) {
            // If filterSwitch is true and the URL does not match the regex, skip the current iteration.
            if (this.filterSwitch && !regex.test(url)) {
                continue;
            }
    
            for (const paramName in this.postParameters[url]) {
                const valuesSet = this.postParameters[url][paramName];
                for (const value of valuesSet) {
                    postParameterPairsSet.add(`${paramName}=${value}`);
                }
            }
        }
    
        return [...postParameterPairsSet];
    }
    
    getQueryParameterValuePairs() {
        const pairs = [];
        const regex = new RegExp(this.filterRegex);
    
        for (const url in this.queryParameters) {
            // If filterSwitch is true and the URL does not match the regex, skip the current iteration.
            if (this.filterSwitch && !regex.test(url)) {
                continue;
            }
    
            for (const paramName in this.queryParameters[url]) {
                const paramValues = this.queryParameters[url][paramName];
                if (paramValues.size > 0) {
                    for (const value of paramValues) {
                        pairs.push(`${paramName}=${value}`);
                    }
                } else {
                    pairs.push(`${paramName}`);
                }
            }
        }
        return [...new Set(pairs)];
    }


    //-----------------------------------------------------------------------
    // "GET BY" GETTERS

    getURLsByLink(link) {
        const urls = Object.keys(this.links).filter(url => this.links[url].has(link));
        
        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            return urls.filter(url => regex.test(url));
        }
    
        // If filterSwitch is off, return the original list of URLs
        return urls;
    }

    getLinksByUrl(url) {
        if (this.filterSwitch) {
            const filterRegexObj = new RegExp(this.filterRegex);
            if (!filterRegexObj.test(url)) {
                return [];  // If the URL does not match the filter regex, return an empty array
            }
        }
    
        return this.links[url] ? Array.from(this.links[url]) : [];
    }

    getLinksByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        const filterRegexObj = new RegExp(this.filterRegex);
        const matchingLinks = new Set();
    
        for (const url in this.links) {
            // If filterSwitch is enabled and the URL doesn't match filterRegex, skip this iteration
            if (this.filterSwitch && !filterRegexObj.test(url)) {
                continue;
            }
    
            for (const link of this.links[url]) {
                if (regex.test(link)) {
                    matchingLinks.add(link);
                }
            }
        }
    
        return [...matchingLinks];
    }

    getURLsWithHeader(headerName) {
        return Object.keys(this.headers).filter(url => this.headers[url][headerName]);
    }

    getURLsByHeader(headerName) {
        const urls = this.getURLsWithHeader(headerName);
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            return urls.filter(url => regex.test(url));
        }
        return urls;
    }
    
    getURLsByInput(inputName) {
        const urls = Object.keys(this.inputs).filter(url => this.inputs[url][inputName]);
        
        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            return urls.filter(url => regex.test(url));
        }

        // If filterSwitch is off, return the original list of URLs
        return urls;
    }
    
    getURLsByInputValue(inputValue) {
        let urls = Object.keys(this.inputs).filter(url => 
            Object.values(this.inputs[url]).some(valuesSet => valuesSet.has(inputValue))
        );

        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            urls = urls.filter(url => regex.test(url));
        }

        return urls;
    }
    
    getURLsByQueryParameter(paramName) {
        let urls = Object.keys(this.queryParameters).filter(url => this.queryParameters[url][paramName]);

        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            urls = urls.filter(url => regex.test(url));
        }

        return urls;
    }
    
    getURLsByQueryParameterValue(paramValue) {
        let urls = Object.keys(this.queryParameters).filter(url => 
            Object.values(this.queryParameters[url]).some(paramValuesSet => paramValuesSet.has(paramValue))
        );

        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            urls = urls.filter(url => regex.test(url));
        }

        return urls;
    }

    getURLsByHeaderValue(headerValue) {
        return Object.keys(this.headers).filter(url => Object.values(this.headers[url]).some(headerSet => headerSet.has(headerValue))).filter(url => {
            if (this.filterSwitch) {
                const regex = new RegExp(this.filterRegex);
                return regex.test(url);
            }
            return true;
        });
    }

    getURLsByHeaderValuePair(pair) {
        const [headerName, value] = pair.split(': ').map(str => str.trim());
        return Object.keys(this.headers).filter(url => this.headers[url][headerName] && this.headers[url][headerName].has(value)).filter(url => {
            if (this.filterSwitch) {
                const regex = new RegExp(this.filterRegex);
                return regex.test(url);
            }
            return true;
        });
    }

    getURLsWithHeaderAndValue(headerName, value) {
        return Object.keys(this.headers).filter(url => this.headers[url][headerName] && this.headers[url][headerName].has(value)).filter(url => {
            if (this.filterSwitch) {
                const regex = new RegExp(this.filterRegex);
                return regex.test(url);
            }
            return true;
        });
    }

    getURLsByPostParameter(paramName) {
        let urls = Object.keys(this.postParameters).filter(url => this.postParameters[url][paramName]);
        
        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            urls = urls.filter(url => regex.test(url));
        }
    
        return urls;
    }

    getURLsByPostParameterValue(paramValue) {
        let urls = Object.keys(this.postParameters)
                        .filter(url => Object.values(this.postParameters[url])
                                            .some(paramValuesSet => paramValuesSet.has(paramValue)));
        
        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            urls = urls.filter(url => regex.test(url));
        }
    
        return urls;
    }

    getURLsByPostParameterValuePair(pair) {
        const [paramName, value] = pair.split('=').map(str => str.trim());
        let matchingURLs = [];
        
        for (const url in this.postParameters) {
            // If the value is blank, we only check for the existence of the parameter name
            if (value === "" && this.postParameters[url].hasOwnProperty(paramName)) {
                // If the parameter exists but has no values or has an empty value, add the URL
                if (!this.postParameters[url][paramName] || this.postParameters[url][paramName].size === 0) {
                    matchingURLs.push(url);
                }
            } 
            // For non-blank values, we match both the parameter name and its value
            else if (this.postParameters[url][paramName] && this.postParameters[url][paramName].has(value)) {
                matchingURLs.push(url);
            }
        }
    
        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch) {
            const regex = new RegExp(this.filterRegex);
            matchingURLs = matchingURLs.filter(url => regex.test(url));
        }
        
        return matchingURLs;
    }

    getURLsByInputTag(tag) {
        let matchingURLs = Object.keys(this.inputTags).filter(url => this.inputTags[url].has(tag));
    
        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch && this.filterRegex) {
            const regex = new RegExp(this.filterRegex);
            matchingURLs = matchingURLs.filter(url => regex.test(url));
        }
    
        return matchingURLs;
    }

    getURLsByInputValuePair(pair) {
        const [inputName, value] = pair.split('=').map(str => str.trim());
        let matchingURLs = [];
        
        for (const url in this.inputs) {
            // If the value is blank, we only check for the existence of the input name
            if (value === "" && this.inputs[url].hasOwnProperty(inputName)) {
                // If the input exists but has no values or has an empty value, add the URL
                if (!this.inputs[url][inputName] || this.inputs[url][inputName].size === 0) {
                    matchingURLs.push(url);
                }
            } 
            // For non-blank values, we match both the input name and its value
            else if (this.inputs[url][inputName] && this.inputs[url][inputName].has(value)) {
                matchingURLs.push(url);
            }
        }
        
        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch && this.filterRegex) {
            const regex = new RegExp(this.filterRegex);
            matchingURLs = matchingURLs.filter(url => regex.test(url));
        }
    
        return matchingURLs;
    }

    getURLsByQueryParameterValuePair(pair) {
        const [paramName, value] = pair.split('=').map(str => str.trim());
        let matchingURLs = [];
        
        for (const url in this.queryParameters) {
            // If the value is blank, we only check for the existence of the parameter name
            if (value === "" && this.queryParameters[url].hasOwnProperty(paramName)) {
                // If the parameter exists but has no values or has an empty value, add the URL
                if (!this.queryParameters[url][paramName] || this.queryParameters[url][paramName].size === 0) {
                    matchingURLs.push(url);
                }
            } 
            // For non-blank values, we match both the parameter name and its value
            else if (this.queryParameters[url][paramName] && this.queryParameters[url][paramName].has(value)) {
                matchingURLs.push(url);
            }
        }
        
        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch && this.filterRegex) {
            const regex = new RegExp(this.filterRegex);
            matchingURLs = matchingURLs.filter(url => regex.test(url));
        }
    
        return matchingURLs;
    }

    getURLsByPostBodyRegex(regexStr) {
        const regex = new RegExp(regexStr);
        let matchingURLs = [];
    
        for (const url in this.postBodies) {
            for (const postBody of this.postBodies[url]) {
                if (regex.test(postBody)) {
                    matchingURLs.push(url);
                    break;  // move to the next URL once a matching postBody is found for this URL
                }
            }
        }
    
        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch && this.filterRegex) {
            const filter = new RegExp(this.filterRegex);
            matchingURLs = matchingURLs.filter(url => filter.test(url));
        }
    
        return matchingURLs;
    }    
    
    getURLsByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        let matchingURLs = [];
        
        for (const url of this.urls) {
            if (regex.test(url)) {
                matchingURLs.push(url);
            }
        }
    
        // If the filterSwitch is on, filter the URLs by the filterRegex
        if (this.filterSwitch && this.filterRegex) {
            const filter = new RegExp(this.filterRegex);
            matchingURLs = matchingURLs.filter(url => filter.test(url));
        }
    
        return matchingURLs;
    }

    getHeadersByUrl(url) {
        if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) return [];
        return Object.keys(this.headers[url] || {});
    }
    
    getHeadersByValue(value) {
        const headerNames = [];
        for (const url in this.headers) {
            for (const headerName in this.headers[url]) {
                if (this.headers[url][headerName].has(value)) {
                    headerNames.push(headerName);
                }
            }
        }
        return [...new Set(headerNames)];
    }
    
    getHeadersByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        return [...new Set(Object.values(this.headers).flatMap(headerObj => Object.keys(headerObj).filter(headerName => regex.test(headerName))))];
    }
    
    getHeaderValuesByUrl(url) {
        if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) return [];
        return [...new Set(Object.values(this.headers[url] || {}).flatMap(set => [...set]))];
    }

    getHeaderValuesByHeader(headerName) {
        return [...new Set(Object.values(this.headers).filter(headerObj => headerObj[headerName]).flatMap(headerObj => [...headerObj[headerName]]))];
    }
    

    getHeaderValuesByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        return [...new Set(Object.values(this.headers).flatMap(headerObj => Object.values(headerObj).filter(set => [...set].some(value => regex.test(value))).flatMap(set => [...set])))];
    }

    // Returns a list of post parameters for a given URL
    getPostParametersByUrl(url) {
        // If filterSwitch is true and the provided URL doesn't match the filterRegex, return an empty array.
        if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) {
            return [];
        }
        // Otherwise, return the post parameters for the provided URL as normal.
        return this.postParameters[url] ? Object.keys(this.postParameters[url]) : [];
    }

    // Returns a list of URLs which have the provided post parameter value
    getPostParametersByValue(value) {
        const parametersMatchingValue = new Set();
    
        for (const url in this.postParameters) {
            // Check if filtering is needed and if the current URL should be excluded.
            if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) {
                continue;  // Skip the current iteration and go to the next URL.
            }
            for (const paramName in this.postParameters[url]) {
                if (this.postParameters[url][paramName].has(value)) {
                    parametersMatchingValue.add(paramName);
                }
            }
        }
        return [...parametersMatchingValue];
    }
    

    // Returns a list of post parameter names which match the provided regex
    getPostParametersByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        const matchingPostParameters = new Set();
    
        for (const url in this.postParameters) {
            // If filtering is enabled and the current URL doesn't match the filter regex, skip to next URL.
            if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) {
                continue;
            }
    
            for (const paramName in this.postParameters[url]) {
                if (regex.test(paramName)) {
                    matchingPostParameters.add(paramName);
                }
            }
        }
    
        return [...matchingPostParameters];
    }

    // Returns a list of post parameters values for a given post parameter
    getPostParameterValuesByParameter(paramName) {
        const values = new Set();
    
        for (const url in this.postParameters) {
            // If filtering is enabled and the current URL doesn't match the filter regex, skip to the next URL.
            if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) {
                continue;
            }
    
            const parameters = this.postParameters[url];
            if (parameters[paramName]) {
                for (const value of parameters[paramName]) {
                    values.add(value);
                }
            }
        }
    
        return [...values];
    }

    // Returns a list of post parameter values that match the provided regex pattern
    getPostParameterValuesByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        const matchingValues = new Set();
    
        for (const url in this.postParameters) {
            // If filtering is enabled and the current URL doesn't match the filter regex, skip to the next URL.
            if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) {
                continue;
            }
    
            for (const valueSet of Object.values(this.postParameters[url])) {
                for (const value of valueSet) {
                    if (regex.test(value)) {
                        matchingValues.add(value);
                    }
                }
            }
        }
    
        return [...matchingValues];
    }

    // Returns a list of query parameter values for a given query parameter
    getQueryParameterValuesByParameter(paramName) {
        const values = new Set();
        const filterRegex = new RegExp(this.filterRegex);
    
        for (const url in this.queryParameters) {
            // If filtering is enabled and the current URL doesn't match the filter regex, skip to the next URL.
            if (this.filterSwitch && !filterRegex.test(url)) {
                continue;
            }
    
            const parameters = this.queryParameters[url];
            if (parameters[paramName]) {
                for (const value of parameters[paramName]) {
                    values.add(value);
                }
            }
        }
    
        return [...values];
    }

    // Returns a list of query parameters which match the provided regex pattern
    getQueryParametersByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        const filterRegexObj = new RegExp(this.filterRegex);
        const matchingParameters = new Set();
    
        for (const url in this.queryParameters) {
            // If filtering is enabled and the current URL doesn't match the filter regex, skip to the next URL.
            if (this.filterSwitch && !filterRegexObj.test(url)) {
                continue;
            }
    
            for (const paramName in this.queryParameters[url]) {
                if (regex.test(paramName)) {
                    matchingParameters.add(paramName);
                }
            }
        }
    
        return [...matchingParameters];
    }
    

    // Returns a list of query parameter values that match the provided regex pattern
    getQueryParameterValuesByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        const filterRegexObj = this.filterSwitch ? new RegExp(this.filterRegex) : null;
        const matchingValues = new Set();
    
        for (const url in this.queryParameters) {
            // If filtering is enabled and the current URL doesn't match the filter regex, skip to the next URL.
            if (this.filterSwitch && !filterRegexObj.test(url)) {
                continue;
            }
    
            for (const valueSet of Object.values(this.queryParameters[url])) {
                for (const value of valueSet) {
                    if (regex.test(value)) {
                        matchingValues.add(value);
                    }
                }
            }
        }
    
        return [...matchingValues];
    }
    

    // Returns a list of input names for a given URL
    getInputsByUrl(url) {
        if (this.filterSwitch) {
            const filterRegexObj = new RegExp(this.filterRegex);
            if (!filterRegexObj.test(url)) {
                return [];  // If the URL does not match the filter regex, return an empty array
            }
        }
    
        return this.inputs[url] ? Object.keys(this.inputs[url]) : [];
    }
    

    // Returns a list of URLs which have the provided input value
    getInputsByValue(value) {
        const inputsMatchingValue = new Set();
        const filterRegexObj = new RegExp(this.filterRegex);
    
        for (const url in this.inputs) {
            // If filterSwitch is enabled and the URL doesn't match filterRegex, skip this iteration
            if (this.filterSwitch && !filterRegexObj.test(url)) {
                continue;
            }
    
            for (const inputName in this.inputs[url]) {
                if (value === "") {
                    // Check for inputs that have no values or are empty
                    if (!this.inputs[url][inputName] || this.inputs[url][inputName].size === 0) {
                        inputsMatchingValue.add(inputName);
                    }
                } else if (this.inputs[url][inputName].has(value)) {
                    inputsMatchingValue.add(inputName);
                }
            }
        }
    
        return [...inputsMatchingValue];
    }
    
    
    // Returns a list of input values for a given input name
    getInputValuesByInput(inputName) {
        const values = new Set();
        const filterRegexObj = new RegExp(this.filterRegex);
    
        for (const url in this.inputs) {
            // If filterSwitch is enabled and the URL doesn't match filterRegex, skip this iteration
            if (this.filterSwitch && !filterRegexObj.test(url)) {
                continue;
            }
    
            const inputs = this.inputs[url];
            if (inputs[inputName]) {
                for (const value of inputs[inputName]) {
                    values.add(value);
                }
            }
        }
    
        return [...values];
    }
    

    // Returns a list of input names which match the provided regex pattern
    getInputsByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        const filterRegexObj = new RegExp(this.filterRegex);
        const matchingInputs = new Set();
    
        for (const url in this.inputs) {
            // If filterSwitch is enabled and the URL doesn't match filterRegex, skip this iteration
            if (this.filterSwitch && !filterRegexObj.test(url)) {
                continue;
            }
    
            for (const inputName in this.inputs[url]) {
                if (regex.test(inputName)) {
                    matchingInputs.add(inputName);
                }
            }
        }
    
        return [...matchingInputs];
    }
    

    getQueryParametersByValue(targetValue) {
        const matches = [];
        const filterRegexObj = new RegExp(this.filterRegex); // Construct a RegExp object from the filterRegex string
    
        // Iterate over each URL's query parameters
        for (const url of Object.keys(this.queryParameters)) {
            // If filterSwitch is enabled and the URL doesn't match filterRegex, skip this iteration
            if (this.filterSwitch && !filterRegexObj.test(url)) {
                continue;
            }
    
            const parameters = this.queryParameters[url];
            
            // Iterate over each parameter for the current URL
            for (const [paramName, values] of Object.entries(parameters)) {
                // Check if the set of values contains the target value
                if (values.has(targetValue)) {
                    matches.push(paramName);
                }
            }
        }
    
        // Return unique matches
        return [...new Set(matches)];
    }

    getPostBodiesByURL(targetUrl) {
        // If filterSwitch is enabled and the targetUrl doesn't match filterRegex, return an empty array
        const filterRegexObj = new RegExp(this.filterRegex); 
        if (this.filterSwitch && !filterRegexObj.test(targetUrl)) {
            return [];
        }
    
        // Check if the target URL exists in the postBodies
        if (this.postBodies.hasOwnProperty(targetUrl)) {
            return [...this.postBodies[targetUrl]];
        }
        return [];
    }

    getPostBodiesByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        const matchingBodies = new Set();
    
        for (const url in this.postBodies) {
            // If filterSwitch is enabled and the URL doesn't match filterRegex, continue to the next URL
            if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) {
                continue;
            }
    
            for (const postBody of this.postBodies[url]) {
                if (regex.test(postBody)) {
                    matchingBodies.add(postBody);
                }
            }
        }
    
        return [...matchingBodies];
    }
    
    
    getPostParameterValuesByUrl(targetUrl) {
        const uniqueValues = new Set();
    
        // If filterSwitch is enabled and the targetUrl doesn't match filterRegex, return an empty array
        const filterRegexObj = new RegExp(this.filterRegex); // Construct a RegExp object from the filterRegex string
        if (this.filterSwitch && !filterRegexObj.test(targetUrl)) {
            return [];
        }
    
        // Check if the target URL exists in the postParameters
        if (this.postParameters.hasOwnProperty(targetUrl)) {
            const parameters = this.postParameters[targetUrl];
            
            // Iterate over each parameter's values for the current URL
            for (const valuesSet of Object.values(parameters)) {
                for (const value of valuesSet) {
                    uniqueValues.add(value);
                }
            }
        }
    
        return [...uniqueValues];
    }
    

    getInputTagsByUrl(targetUrl) {
        // If filterSwitch is enabled and the targetUrl doesn't match filterRegex, return an empty array
        const filterRegexObj = new RegExp(this.filterRegex); // Construct a RegExp object from the filterRegex string
        if (this.filterSwitch && !filterRegexObj.test(targetUrl)) {
            return [];
        }
    
        // Check if the target URL exists in the inputTags
        if (this.inputTags.hasOwnProperty(targetUrl)) {
            return [...this.inputTags[targetUrl]];
        }
        return [];
    }
    

    getInputTagsByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        const matchingTags = new Set();
    
        for (const url in this.inputTags) {
            // If filterSwitch is enabled and the URL doesn't match filterRegex, continue to the next URL
            if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) {
                continue;
            }
    
            for (const tag of this.inputTags[url]) {
                if (regex.test(tag)) {
                    matchingTags.add(tag);
                }
            }
        }
    
        return [...matchingTags];
    }
    
    
    getInputValuesByUrl(targetUrl) {
        // Check if filterSwitch is enabled and if the targetUrl doesn't match filterRegex
        if (this.filterSwitch && !new RegExp(this.filterRegex).test(targetUrl)) {
            return []; // Return an empty array if the URL doesn't match the filter
        }
    
        const values = new Set();
        
        if (this.inputs[targetUrl]) {
            for (const inputSet of Object.values(this.inputs[targetUrl])) {
                for (const value of inputSet) {
                    values.add(value);
                }
            }
        }
        
        return [...values];
    }
    

    getInputValuesByRegex(regexStr) {
        const regex = new RegExp(regexStr);
        const matchingValues = new Set();
        
        for (const url in this.inputs) {
            // If filterSwitch is on and the URL doesn't match filterRegex, continue to the next URL
            if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) {
                continue;
            }
    
            for (const inputSet of Object.values(this.inputs[url])) {
                for (const value of inputSet) {
                    if (regex.test(value)) {
                        matchingValues.add(value);
                    }
                }
            }
        }
        
        return [...matchingValues];
    }
    


    getInputValuePairsByUrl(targetUrl) {
        const pairs = [];
        
        // If filterSwitch is on and the target URL doesn't match filterRegex, return an empty array
        if (this.filterSwitch && !new RegExp(this.filterRegex).test(targetUrl)) {
            return pairs;
        }
        
        // Check if the given URL exists in this.inputs
        if (!this.inputs[targetUrl]) {
            return pairs;
        }
    
        for (const inputName in this.inputs[targetUrl]) {
            const values = this.inputs[targetUrl][inputName];
            if (values.size > 0) {
                // If there are values, add them as separate pairs
                for (const value of values) {
                    pairs.push(`${inputName}=${value}`);
                }
            } else {
                // If there are no values, add just the input name
                pairs.push(`${inputName}=`);
            }
        }
    
        // Return a de-duplicated array
        return [...new Set(pairs)];
    }
    
    
    getInputValuePairsByRegex(regexString) {
        const pairs = [];
        const regex = new RegExp(regexString);
        const filter = new RegExp(this.filterRegex);
        
        for (const url in this.inputs) {
            // If filterSwitch is on and the current URL doesn't match filterRegex, skip this URL
            if (this.filterSwitch && !filter.test(url)) {
                continue;
            }
    
            // Check if the URL matches the given regex
            if (regex.test(url)) {
                for (const inputName in this.inputs[url]) {
                    const values = this.inputs[url][inputName];
                    if (values.size > 0) {
                        // If there are values, add them as separate pairs
                        for (const value of values) {
                            pairs.push(`${inputName}=${value}`);
                        }
                    } else {
                        // If there are no values, add just the input name
                        pairs.push(`${inputName}=`);
                    }
                }
            }
        }
        
        // Return a de-duplicated array
        return [...new Set(pairs)];
    }
    

    getHeaderValuePairsByUrl(targetUrl) {
        // If filterSwitch is on and the targetUrl doesn't match filterRegex, return an empty array
        if (this.filterSwitch && !new RegExp(this.filterRegex).test(targetUrl)) {
            return [];
        }
    
        const headerPairsSet = new Set();
        const headersObj = this.headers[targetUrl] || {};
        for (const headerName in headersObj) {
            for (const value of headersObj[headerName]) {
                headerPairsSet.add(`${headerName}: ${value}`);
            }
        }
        return [...headerPairsSet];
    }
    
    
    getHeaderValuePairsByRegex(regexStr) {
        const headerPairsSet = new Set();
        const regex = new RegExp(regexStr);
    
        for (const url in this.headers) {
            // If filterSwitch is true and url doesn't match filterRegex, skip this url
            if (this.filterSwitch && !new RegExp(this.filterRegex).test(url)) {
                continue;
            }
    
            for (const headerName in this.headers[url]) {
                const valuesSet = this.headers[url][headerName];
                for (const value of valuesSet) {
                    const pairString = `${headerName}: ${value}`;
                    if (regex.test(pairString)) {
                        headerPairsSet.add(pairString);
                    }
                }
            }
        }
        return [...headerPairsSet];
    }
    
    
    getPostParameterValuePairsByUrl(targetUrl) {
        const postParameterPairsSet = new Set();
    
        // If filterSwitch is true and targetUrl doesn't match filterRegex, return an empty array
        if (this.filterSwitch && !new RegExp(this.filterRegex).test(targetUrl)) {
            return [...postParameterPairsSet];
        }
    
        // Check if the given URL exists in this.postParameters
        if (!this.postParameters[targetUrl]) {
            return [...postParameterPairsSet];
        }
    
        for (const paramName in this.postParameters[targetUrl]) {
            // Retrieve the Set of values for each parameter name for the given URL
            const valuesSet = this.postParameters[targetUrl][paramName];
            for (const value of valuesSet) {
                // Concatenate the paramName and value into a string and add to the Set
                postParameterPairsSet.add(`${paramName}=${value}`);
            }
        }
    
        // Convert the Set to an array to remove duplicates, and return
        return [...postParameterPairsSet];
    }
    
    
    getPostParameterValuePairsByRegex(regexStr) {
        const postParameterPairsSet = new Set();
    
        // Compile the regex
        const regex = new RegExp(regexStr); 
    
        // Compile the filter regex
        const filter = new RegExp(this.filterRegex);
    
        // Iterate through the postParameters object
        for (const url in this.postParameters) {
            // If filterSwitch is true and URL doesn't match filterRegex, continue to next URL
            if (this.filterSwitch && !filter.test(url)) {
                continue; // skip this URL and continue to the next one
            }
            
            for (const paramName in this.postParameters[url]) {
                // Retrieve the Set of values for each parameter name
                const valuesSet = this.postParameters[url][paramName];
                for (const value of valuesSet) {
                    const pairString = `${paramName}=${value}`;
                    // Check if the pairString matches the regex
                    if (regex.test(pairString)) {
                        postParameterPairsSet.add(pairString);
                    }
                }
            }
        }
    
        // Convert the Set to an array to remove duplicates, and return
        return [...postParameterPairsSet];
    }
    
    
    getQueryParameterValuePairsByRegex(regexStr) {
        const queryParameterPairsSet = new Set();
    
        // Compile the regex
        const regex = new RegExp(regexStr); 
    
        // Compile the filter regex
        const filter = new RegExp(this.filterRegex);
    
        // Iterate through the queryParameters object
        for (const url in this.queryParameters) {
            // If filterSwitch is true and URL doesn't match filterRegex, continue to next URL
            if (this.filterSwitch && !filter.test(url)) {
                continue; // skip this URL and continue to the next one
            }
            
            for (const paramName in this.queryParameters[url]) {
                const paramValues = this.queryParameters[url][paramName];
                if (paramValues.size > 0) {
                    // If there are values, add them as separate pairs
                    for (const value of paramValues) {
                        const pairString = `${paramName}=${value}`;
                        // Check if the pairString matches the regex
                        if (regex.test(pairString)) {
                            queryParameterPairsSet.add(pairString);
                        }
                    }
                } else {
                    // If there are no values, add just the parameter name (if it matches the regex)
                    if (regex.test(paramName)) {
                        queryParameterPairsSet.add(paramName);
                    }
                }
            }
        }
    
        // Convert the Set to an array to remove duplicates, and return
        return [...queryParameterPairsSet];
    }
    
    
  
    //-----------------------------------------------------------------------
    getInfoByCriteria(infoType, matchType, matchValue) {
        if (!infoType || !matchType) {
            throw new Error('All infoType and matchType parameters are required');
        }
    
        switch (infoType) {
            case 'search-urls':
                switch (matchType) {
                    case 'criteria-links':
                        return this.getURLsByLink(matchValue);
                    case 'criteria-headers':
                        return this.getURLsByHeader(matchValue);
                    case 'criteria-header-values':
                        return this.getURLsByHeaderValue(matchValue);
                    case 'criteria-header-value-pairs':
                        return this.getURLsByHeaderValuePair(matchValue);
                    case 'criteria-post-body-regex':
                        return this.getURLsByPostBodyRegex(matchValue);
                    case 'criteria-post-parameters':
                        return this.getURLsByPostParameter(matchValue);
                    case 'criteria-post-parameter-values':
                        return this.getURLsByPostParameterValue(matchValue);
                    case 'criteria-post-parameter-value-pairs':
                        return this.getURLsByPostParameterValuePair(matchValue);
                    case 'criteria-inputs':
                        return this.getURLsByInput(matchValue);
                    case 'criteria-input-values':
                        return this.getURLsByInputValue(matchValue);
                    case 'criteria-input-value-pairs':
                        return this.getURLsByInputValuePair(matchValue);
                    case 'criteria-input-tags':
                        return this.getURLsByInputTag(matchValue);
                    case 'criteria-query-parameters':
                        return this.getURLsByQueryParameter(matchValue);
                    case 'criteria-query-parameters-values':
                        return this.getURLsByQueryParameterValue(matchValue);
                    case 'criteria-query-parameter-value-pairs':
                        return this.getURLsByQueryParameterValuePair(matchValue);
                    case 'criteria-url-regex':
                        return this.getURLsByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-urls');
                }
            case 'search-links':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getLinksByUrl(matchValue);
                    case 'criteria-link-regex':
                        return this.getLinksByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-headers');
                }
            case 'search-headers':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getHeadersByUrl(matchValue);
                    case 'criteria-header-values':
                        return this.getHeadersByValue(matchValue);
                    case 'criteria-header-regex':
                        return this.getHeadersByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-headers');
                }
            case 'search-header-values':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getHeaderValuesByUrl(matchValue);
                    case 'criteria-headers':
                        return this.getHeaderValuesByHeader(matchValue);
                    case 'criteria-header-value-regex':
                        return this.getHeaderValuesByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-header-values');
                }

            case 'search-header-value-pairs':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getHeaderValuePairsByUrl(matchValue);
                    case 'criteria-header-value-pair-regex':
                        return this.getHeaderValuePairsByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-header-value-pairs');
                }
            case 'search-post-bodies':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getPostBodiesByURL(matchValue);
                    case 'criteria-post-body-regex':
                        return this.getPostBodiesByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-post-bodies');
                }
            case 'search-post-parameters':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getPostParametersByUrl(matchValue);
                    case 'criteria-post-parameter-values':
                        return this.getPostParametersByValue(matchValue);
                    case 'criteria-post-parameter-regex':
                        return this.getPostParametersByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-post-parameters');
                }
            case 'search-post-parameter-values':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getPostParameterValuesByUrl(matchValue);
                    case 'criteria-post-parameters':
                        return this.getPostParameterValuesByParameter(matchValue);
                    case 'criteria-post-parameter-value-regex':
                        return this.getPostParameterValuesByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-post-parameter-values');
                }
            case 'search-post-parameter-value-pairs':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getPostParameterValuePairsByUrl(matchValue);
                    case 'criteria-post-parameter-value-pair-regex':
                        return this.getPostParameterValuePairsByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-post-parameter-value-pairs');
                }
            case 'search-inputs':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getInputsByUrl(matchValue);
                    case 'criteria-input-values':
                        return this.getInputsByValue(matchValue);
                    case 'criteria-input-regex':
                        return this.getInputsByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-inputs');
                }
            case 'search-input-tags':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getInputTagsByUrl(matchValue);
                    case 'criteria-input-tag-regex':
                        return this.getInputTagsByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-input-tags');
                }
            case 'search-input-values':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getInputValuesByUrl(matchValue);
                    case 'criteria-inputs':
                        return this.getInputValuesByInput(matchValue);
                    case 'criteria-input-value-regex':
                        return this.getInputValuesByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-input-values');
                }
            case 'search-input-value-pairs':
                switch (matchType) {
                    case 'criteria-urls':
                        return this.getInputValuePairsByUrl(matchValue);
                    case 'criteria-input-value-pair-regex':
                        return this.getInputValuePairsByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-input-value-pairs');
                }
            case 'search-query-parameters':
                switch (matchType) {
                    case 'criteria-query-parameter-values':
                        return this.getQueryParametersByValue(matchValue);
                    case 'criteria-query-parameter-regex':
                        return this.getQueryParametersByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-query-parameters');
                }
            case 'search-query-parameter-values':
                switch (matchType) {
                    case 'criteria-query-parameters':
                        return this.getQueryParameterValuesByParameter(matchValue);
                    case 'criteria-query-parameter-value-regex':
                        return this.getQueryParameterValuesByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-query-parameter-values');
                }
            case 'search-query-parameter-value-pairs':
                switch (matchType) {
                    case 'criteria-query-parameter-value-pair-regex':
                        return this.getQueryParameterValuePairsByRegex(matchValue);
                    default:
                        throw new Error('Unsupported match type for search-query-parameter-value-pairs');
                }
            default:
                throw new Error('Unsupported info type');
        }
    }
    //-----------------------------------------------------------------------
    
}

//===========================================================================

function getCurrentDateTimeString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// EXPORT
function downloadData(manager) {
    const filename = `Omen_Eye_${getCurrentDateTimeString()}.json`;
    const dataStr = manager.export();
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
}



// Create an instance of the DataManager class
const dataManager = new DataManager();

chrome.webRequest.onBeforeRedirect.addListener(
    (details) => {
        if (dataManager.isActive && dataManager.matchesCollectionScope(details.url)) { 
            dataManager.addURL(details.url);
        }

        if (dataManager.isActive && dataManager.matchesCollectionScope(details.redirectUrl)) { 
            dataManager.addURL(details.redirectUrl);
        }

    },
    { urls: ["<all_urls>"] }
);

chrome.webRequest.onCompleted.addListener(
    (details) => {
        if (dataManager.isActive && dataManager.matchesCollectionScope(details.url)) { // Check if isActive is true
            // Add the URL to the DataManager
            dataManager.addURL(details.url);

            // Iterate through the response headers and add them to the DataManager
            if (details.responseHeaders) {
                details.responseHeaders.forEach((header) => {
                const name = header.name;
                const value = header.value;
                dataManager.addHeader(details.url, name, value);
                });
            }
        }
    },
    { urls: ["<all_urls>"] }, // Replace with appropriate URL pattern if needed
    ["responseHeaders"]
);

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        // Check if data collection is active and the URL matches the scope
        if (dataManager.isActive && dataManager.matchesCollectionScope(details.url) && details.method === "POST") {
            const url = details.url;
            const requestBody = details.requestBody;

            // Handle form data (application/x-www-form-urlencoded or multipart/form-data)
            if (requestBody && requestBody.formData) {
                for (const [paramName, paramValues] of Object.entries(requestBody.formData)) {
                    paramValues.forEach(paramValue => {
                        dataManager.addPostParameter(url, paramName, paramValue);
                    });
                }
            }

            // Handle raw data (could be application/json, application/xml, text/plain, etc.)
            if (requestBody && requestBody.raw) {
                const encoder = new TextDecoder("utf-8");
                const postBody = encoder.decode(new Uint8Array(requestBody.raw[0].bytes));
                dataManager.addPostBody(url, postBody);
            }
        }
    },
    { urls: ["<all_urls>"], types: ["main_frame", "sub_frame"] },
    ["requestBody"]
);



function handleRequestMessage(message, sender, sendResponse) {
    if (message.type == 'get-is-active') {
        sendResponse({ success: true, state: dataManager.isActive});

    } else if (message.type == 'change-is-active') {
        dataManager.isActive = message.action;
        sendResponse({ success: true });

    } else if (message.type == 'collect-form-data') {
        //dataManager.isActive && 
        if (dataManager.isActive) {
            dataManager.addFormData(message.url, message.formData);
        }
        sendResponse({ success: true });

    } else if (message.type == 'collect-links') {
        //dataManager.isActive && 
        if (dataManager.isActive) {
            dataManager.addLinks(message.url, message.links);
        }
        sendResponse({ success: true });

    } else {
        switch (message.type) {
            case 'get-scope-switch':
                sendResponse({ success: true, state: dataManager.scopeSwitch });
                break;
            case 'set-scope-switch':
                dataManager.scopeSwitch = message.action;
                sendResponse({ success: true });
                break;
            case 'get-scope-regex':
                sendResponse({ success: true, value: dataManager.scopeRegex });
                break;
            case 'set-scope-regex':
                dataManager.scopeRegex = message.action;
                sendResponse({ success: true });
                break;

            case 'get-filter-switch':
                sendResponse({ success: true, state: dataManager.filterSwitch });
                break;
            case 'set-filter-switch':
                dataManager.filterSwitch = message.action;
                sendResponse({ success: true });
                break;
            case 'get-filter-regex':
                sendResponse({ success: true, value: dataManager.filterRegex });
                break;
            case 'set-filter-regex':
                dataManager.filterRegex = message.action;
                sendResponse({ success: true });
                break;

            case 'get-output-filter-switch':
                sendResponse({ success: true, state: dataManager.outputFilterSwitch });
                break;
            case 'set-output-filter-switch':
                dataManager.outputFilterSwitch = message.action;
                sendResponse({ success: true });
                break;
            case 'get-output-filter-regex':
                sendResponse({ success: true, value: dataManager.outputFilterRegex });
                break;
            case 'set-output-filter-regex':
                dataManager.outputFilterRegex = message.action;
                sendResponse({ success: true });
                break;







            case 'search':
                sendResponse( dataManager.outputFilter(dataManager.getInfoByCriteria(message.action, message.criteria, message.value) ));
                break;
            case 'all-urls':
                sendResponse(dataManager.outputFilter(dataManager.getAllURLs()));
                break;
            case 'all-links':
                sendResponse(dataManager.outputFilter(dataManager.getAllLinks()));
                break;
            case 'all-headers':
                sendResponse(dataManager.outputFilter(dataManager.getAllHeaders()));
                break;
            case 'all-header-values':
                sendResponse(dataManager.outputFilter(dataManager.getAllHeaderValues()));
                break;
            case 'all-post-bodies':
                sendResponse(dataManager.outputFilter(dataManager.getAllPostBodies()));
            case 'all-post-parameters':
                sendResponse(dataManager.outputFilter(dataManager.getAllPostParameters()));
                break;
            case 'all-post-parameter-values':
                sendResponse(dataManager.outputFilter(dataManager.getAllPostParametersValues()));
                break;
            case 'all-inputs':
                sendResponse(dataManager.outputFilter(dataManager.getAllInputs()));
                break;
            case 'all-input-tags':
                sendResponse(dataManager.outputFilter(dataManager.getAllInputTags()));
                break;
            case 'all-input-values':
                sendResponse(dataManager.outputFilter(dataManager.getAllInputValues()));
                break;
            case 'all-query-parameters':
                sendResponse(dataManager.outputFilter(dataManager.getAllQueryParameters()));
                break;
            case 'all-query-parameters-values':
                sendResponse(dataManager.outputFilter(dataManager.getAllQueryParametersValues()));
                break;
            //----------------------------------------------------------
            //PAIRS
            case 'all-input-value-pairs':
                sendResponse(dataManager.outputFilter(dataManager.getInputValuePairs()));
                break;
            case 'all-header-value-pairs':
                sendResponse(dataManager.outputFilter(dataManager.getHeaderValuePairs()));
                break;
            case 'all-post-parameter-value-pairs':
                sendResponse(dataManager.outputFilter(dataManager.getPostParameterValuePairs()));
                break;
            case 'all-query-parameter-value-pairs':
                sendResponse(dataManager.outputFilter(dataManager.getQueryParameterValuePairs()));
                break;

            case 'import':
                dataManager.import(message.action);
                sendResponse([]);
                break;

            case 'export':
                downloadData(dataManager);
                sendResponse([]);
                break;

            
            case 'clear':
                dataManager.clear()
                sendResponse([]);
                break;
            //----------------------------------------------------------
            default:
                sendResponse({ error: 'Invalid action' });
        }
    }
  }
  
chrome.runtime.onMessage.addListener(handleRequestMessage);
    