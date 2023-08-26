function collectFormData() {
    let formData = [];
  
    // For <input>, <textarea>, <select>, etc. tags
    const elements = document.querySelectorAll('input, textarea, select, option, button, datalist');
    for (const element of elements) {
      let details = {
        name: element.name || null,
        value: element.value || null,
        type: element.type || element.tagName.toLowerCase(), // For distinguishing text, checkbox, radio, etc.
        tag: element.outerHTML.split('>')[0] + '>' // Getting the opening tag of the element
      };
      formData.push(details);
    }
  
    return formData;
  }

function scrapeAllLinks() {
  const selectors = [
      'a[href]', 
      'img[src]', 
      'link[href]', 
      'script[src]', 
      'source[src]', 
      'source[srcset]', 
      'video[src]', 
      'form[action]'
  ];
  
  const currentUrl = new URL(window.location.href);
  
  let urls = [];

  selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);

      elements.forEach(element => {
          if (selector === 'source[srcset]') {
              const srcset = element.getAttribute('srcset');
              const srcsetLinks = srcset.split(',').map(part => part.trim().split(' ')[0]);
              
              srcsetLinks.forEach(l => {
                  const absoluteUrl = new URL(l, currentUrl);
                  urls.push(absoluteUrl.toString());
              });
          } else {
              const attribute = selector.split('[')[1].slice(0, -1);  // Extracts attribute name like href, src, etc.
              const link = element.getAttribute(attribute);
              
              if (link) {
                  const absoluteUrl = new URL(link, currentUrl);
                  urls.push(absoluteUrl.toString());
              }
          }
      });
  });

  return [...new Set(urls)];  // remove duplicates
}



// Assuming the URL is needed for storing form data
const url = window.location.href;
const formData = collectFormData();
const links = scrapeAllLinks();


// Send formData to the background script for processing
chrome.runtime.sendMessage({ type: 'collect-form-data', url: url, formData: formData });
chrome.runtime.sendMessage({ type: 'collect-links', url: url, links: links});

  