// Helper Functions
function addEventListenerById(id, callback) {
    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById(id).addEventListener("click", callback);
    });
}

function clearOutputDiv() {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ''; // Clear previous content
}

function populateLines(data, formatter) {
    clearOutputDiv();
    const outputDiv = document.getElementById('output');

    data.forEach(item => {
        const line = document.createElement('div');
        line.className = 'output-item';
        line.textContent = formatter(item);
        outputDiv.appendChild(line);
    });
}

function populateOutput(data) {
    populateLines(data, item => item);
}

function updateSearchCriteria() {
    const actionSelect = document.getElementById('search-action');
    const criteriaSelect = document.getElementById('search-criteria');
    const selectedAction = actionSelect.value;

    // Clear the existing options
    criteriaSelect.innerHTML = '';

    let options;
    
    switch (selectedAction) {
        case 'search-urls':
            options = [
                { value: 'criteria-links', text: 'Link', label: 'with' },
                { value: 'criteria-headers', text: 'Header', label: 'with' },
                { value: 'criteria-header-values', text: 'Header Value', label: 'with' },
                { value: 'criteria-header-value-pairs', text: 'Header/Value Pair', label: 'with' },
                { value: 'criteria-post-body-regex', text: 'Post Body Regex', label: 'with' },
                { value: 'criteria-post-parameters', text: 'Post Parameter', label: 'with' },
                { value: 'criteria-post-parameter-values', text: 'Post Parameter Value', label: 'with' },
                { value: 'criteria-post-parameter-value-pairs', text: 'Post Parameter/Value Pair', label: 'with' },
                { value: 'criteria-inputs', text: 'Input', label: 'with' },
                { value: 'criteria-input-values', text: 'Input Value', label: 'with' },
                { value: 'criteria-input-value-pairs', text: 'Input/Value Pair', label: 'with' },
                { value: 'criteria-input-tags', text: 'Input Tag', label: 'with' },
                { value: 'criteria-query-parameters', text: 'Query Parameter', label: 'with' },
                { value: 'criteria-query-parameters-values', text: 'Query Parameter Value', label: 'with' },
                { value: 'criteria-query-parameter-value-pairs', text: 'Query Parameter/Value Pair', label: 'with' },
                { value: 'criteria-url-regex', text: 'Regex', label: 'with' },
            ];
            break;
        case 'search-links':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-link-regex', text: 'Regex', label: 'with' },
            ];
            break;
        case 'search-headers':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-header-values', text: 'Header Value', label: 'with' },
                { value: 'criteria-header-regex', text: 'Regex', label: 'with' },
            ];
            break;
        case 'search-header-values':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-headers', text: 'Header', label: 'for'  },
                { value: 'criteria-header-value-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-header-value-pairs':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-header-value-pair-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-post-bodies':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-post-body-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-post-parameters':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-post-parameter-values', text: 'POST Parameter Value', label: 'with' },
                { value: 'criteria-post-parameter-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-post-parameter-values':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-post-parameters', text: 'Post Parameter', label: 'for' },
                { value: 'criteria-post-parameter-value-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-post-parameter-value-pairs':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-post-parameter-value-pair-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-inputs':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-input-values', text: 'Input Value', label: 'with' },
                { value: 'criteria-input-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-input-tags':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-input-tag-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-input-values':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-inputs', text: 'Input', label: 'for' },
                { value: 'criteria-input-value-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-input-value-pairs':
            options = [
                { value: 'criteria-urls', text: 'URL', label: 'for' },
                { value: 'criteria-input-value-pair-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-query-parameters':
            options = [
                { value: 'criteria-query-parameter-values', text: 'Query Parameter Value', label: 'with' },
                { value: 'criteria-query-parameter-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-query-parameter-values':
            options = [
                { value: 'criteria-query-parameters', text: 'Query Parameter', label: 'for' },
                { value: 'criteria-query-parameter-value-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        case 'search-query-parameter-value-pairs':
            options = [
                { value: 'criteria-query-parameter-value-pair-regex', text: 'Regex', label: 'with'  },
            ];
            break;
        default:

            throw new Error('Could not identify case in popup.js: ' + selectedAction)

    }

    // Append the new options to the criteria select
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option.value;
        optElement.textContent = option.text;
        optElement.dataset.label = option.label; // Store the label in a data attribute
        criteriaSelect.appendChild(optElement);
    });
    
    // Update the label based on the selected option
    updateCriteriaLabel();
}

function updateCriteriaLabel() {
    const criteriaSelect = document.getElementById('search-criteria');
    const criteriaLabel = document.querySelector('label[for="search-criteria"]');
    const selectedOption = criteriaSelect.options[criteriaSelect.selectedIndex];
    const labelText = selectedOption ? selectedOption.dataset.label : ''; // Retrieve the label from the data attribute
    criteriaLabel.textContent = labelText;
}

//===========================================================================


// Event Listener for "Get All" Button
addEventListenerById("getAllButton", function() {
    const selectedAction = document.getElementById('get-all-action').value;
    chrome.runtime.sendMessage({ type: selectedAction }, function(data) {
        populateOutput(data);
    });
});

// Event Listener for "Search" Button
addEventListenerById("searchButton", function() {
    const action = document.getElementById('search-action').value;
    const criteria = document.getElementById('search-criteria').value;
    const searchValue = document.getElementById('search-value').value;

    chrome.runtime.sendMessage({ type: 'search', action: action, criteria: criteria, value: searchValue }, function(data) {
        populateOutput(data);
    });
});

// Event Listener for "search-action" dropdown change
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('search-action').addEventListener('change', updateSearchCriteria);
    document.getElementById('search-criteria').addEventListener('change', updateCriteriaLabel);
    // Call the function on page load to set the initial state
    updateSearchCriteria();
});

// Event Listener for "Clear" Button
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('clear').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all information? This cannot be undone.')) {
            console.log('Clearing all information...'); // Add this line
            chrome.runtime.sendMessage({ type: 'clear' }, function(data) {
                alert('All information has been cleared.');
                populateOutput(data);
            });
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    collectSwitch = document.getElementById("collectSwitch");
    chrome.runtime.sendMessage({type: "get-is-active"}, response => {
        collectSwitch.checked = response.state;
    });

    collectSwitch.addEventListener('change', function() {
        chrome.runtime.sendMessage({ type: 'change-is-active', action: collectSwitch.checked }, function() {});
    });
});



function readFileAsJson() {
    const fileInput = document.getElementById('fileInput');
    
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      
      // Ensure the file is a JSON file
      if (file.type !== "application/json") {
        alert('Please select a JSON file.');
        return;
      }
  
      const reader = new FileReader();
  
      reader.onload = function(event) {
        const jsonString = event.target.result; // Here's the raw JSON string
        
        try {
          const jsonObj = JSON.parse(jsonString);
          chrome.runtime.sendMessage({type: "import", action: jsonString}, function(data) {populateOutput(data)});
        } catch (e) {
          alert('Error parsing JSON file: ' + e.toString());
        }
      };
  
      reader.onerror = function(event) {
        alert('Error reading file: ' + event.target.error);
      };
  
      reader.readAsText(file);
    } else {
      alert('No file selected.');
    }
  }

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('exportBtn').addEventListener('click', function() {       
        chrome.runtime.sendMessage({type: "export"}, function(data) {populateOutput(data)});
    });

    document.getElementById('importBtn').addEventListener('click', function() {
        // Trigger the file input dialog when the button is clicked
        
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', readFileAsJson);
});





document.addEventListener("DOMContentLoaded", function() {
    // Get the button element by its ID
    const openTabButton = document.getElementById("new-tab");

    // Add a click event listener to the button
    openTabButton.addEventListener("click", function() {
        // Use the chrome.tabs API to create a new tab
        chrome.tabs.create({url: 'tab.html'});
    });
});



//---------------------------------------------------------------------------
// Load the saved states when the popup is opened
document.addEventListener('DOMContentLoaded', function() {
    scopeSwitch = document.getElementById("scopeSwitch");
    scopeRegex = document.getElementById("scopeRegex");
    filterSwitch = document.getElementById("filterSwitch");
    filterRegex = document.getElementById("filterRegex");

    outputFilterSwitch = document.getElementById("outputFilterSwitch");
    outputFilterRegex = document.getElementById("outputFilterRegex");

    chrome.runtime.sendMessage({ type: 'get-scope-switch' , action: scopeSwitch.checked }, response => {
        scopeSwitch.checked = response.state;
    });
    scopeSwitch.addEventListener('change', function() {
        chrome.runtime.sendMessage({ type: 'set-scope-switch' , action: scopeSwitch.checked });
    });

    chrome.runtime.sendMessage({ type: 'get-scope-regex', action: scopeRegex.value }, response => {
        scopeRegex.value = response.value;
    });
    scopeRegex.addEventListener('input', function() {
        chrome.runtime.sendMessage({ type: 'set-scope-regex', action: scopeRegex.value });
    });

    chrome.runtime.sendMessage({ type: 'get-filter-switch', action: filterSwitch.checked }, response => {
        filterSwitch.checked = response.state;
    });
    filterSwitch.addEventListener('change', function() {
        chrome.runtime.sendMessage({ type: 'set-filter-switch', action: filterSwitch.checked });
    });

    chrome.runtime.sendMessage({ type: 'get-filter-regex', action: filterRegex.value }, response => {
        filterRegex.value = response.value;
    });
    filterRegex.addEventListener('input', function() {
        chrome.runtime.sendMessage({ type: 'set-filter-regex', action: filterRegex.value });
    });

    chrome.runtime.sendMessage({ type: 'get-output-filter-switch', action: outputFilterSwitch.checked }, response => {
        outputFilterSwitch.checked = response.state;
    });
    outputFilterSwitch.addEventListener('change', function() {
        chrome.runtime.sendMessage({ type: 'set-output-filter-switch', action: outputFilterSwitch.checked });
    });

    chrome.runtime.sendMessage({ type: 'get-output-filter-regex', action: outputFilterRegex.value }, response => {
        outputFilterRegex.value = response.value;
    });
    outputFilterRegex.addEventListener('input', function() {
        chrome.runtime.sendMessage({ type: 'set-output-filter-regex', action: outputFilterRegex.value });
    });
});



//===========================================================================