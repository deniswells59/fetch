import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

const primaryColors = ['red', 'blue', 'yellow'];
const defaultOpts   = { page: 1, colors: [] };

/**
   * Retrieves records from API, uses options object to build
   * query string.
   * @param {Object} options - options to query for
   * @param {string} options.page - the page to query for
   * @param {string[]} options.colors - the colors to query for
   * @returns {Promise} Promise object represents API response
   */
const retrieve = options => {
  return new Promise(resolve => {

    // Defaults if missing data
    if(!options) options = defaultOpts;
    if(!options.page) options.page = defaultOpts.page;

    const url = buildUrl(options);

    fetch(url)
      .then(res => res.json())
      .then(res => {
        const responseObj = buildResponse(res, options);
        return resolve(responseObj);
      })
      .catch(err => {
        console.log('ERR', err);
        return resolve({});
      });

  });
}

/**
   * Builds URL for based on options used.
   * @param {Object} opts - options to query for
   * @returns {string} url and query string
   */
const buildUrl = opts => {
  const url = new URI(window.path);
  if(!opts) return url.toString();

  const urlOpts = {
    limit: 11,
    offset: (opts.page - 1) * 10,
    'color[]': opts.colors
  };

  url.query(urlOpts);

  return url.toString();
}

/**
   * Builds specific response object to resolve request.
   * @param {Object[]} dataArr - response from API
   * @param {Object} options - options to query for
   * @returns {Object} specific response object
   */
const buildResponse = (dataArr, options) => {
  // Boolean checks for next pages,
  // splice to removes extra record.
  const nextPageExists = dataArr.splice(10).length > 0;

  const ids  = dataArr.map(returnIds);
  const open = dataArr
              .filter(r => returnByDisposition(r, 'open'))
              .map(addPrimaryBool);

  const closedPrimaryCount = dataArr
                            .filter(r => returnByDisposition(r, 'closed'))
                            .filter(returnPrimary)
                            .length;

  const previousPage = options.page > 1 ? options.page - 1 : null;
  const nextPage     = nextPageExists ? options.page + 1 : null;

  const responseObj = {
    ids,
    open,
    previousPage,
    nextPage,
    closedPrimaryCount,
  };

  return responseObj;
}


/////////////      Build Response Helpers     ///////////////////
/////////////////////////////////////////////////////////////////
const returnPrimary= record => {
  return primaryColors.indexOf(record.color) >= 0;
}

const returnByDisposition = (record, disposition) => {
  return record.disposition === disposition;
}

const returnIds = record => {
  return record.id;
}

const addPrimaryBool = record => {
  record.isPrimary = false;
  if(returnPrimary(record)) record.isPrimary = true;
  return record;
}

export default retrieve;
