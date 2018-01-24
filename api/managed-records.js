import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

const primaryColors = ['red', 'blue', 'yellow'];
const defaultOpts   = { page: 1, colors: [] };

const retrieve = options => {
  return new Promise((resolve, reject) => {
    if(!options) options = defaultOpts;
    if(!options.page) options.page = defaultOpts.page;

    let url = buildUrl(options);

    fetch(url)
      .then(res => {
        return res.json()
      })
      .then(res => {
        let responseObj = buildResponse(res, options);
        return resolve(responseObj);
      })
      .catch(err => {
        console.log('ERR', err);
        return resolve({})
      });

  });
}

const buildResponse = (dataArr, options) => {
  let nextPage = dataArr.splice(10).length > 0;

  let ids  = dataArr.map(returnIds);
  let open = dataArr
              .filter(r => returnByDisposition(r, 'open'))
              .map(addPrimaryBool);

  let closedPrimaryCount = dataArr
                            .filter(r => returnByDisposition(r, 'closed'))
                            .filter(returnPrimary)
                            .length;

  let previousPage = options.page > 1 ? options.page - 1 : null;
  let nextPage     = nextPage ? options.page + 1 : null;

  let responseObj = {
    ids,
    open,
    previousPage,
    nextPage,
    closedPrimaryCount,
  };

  return responseObj;
}

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

const buildUrl = opts => {
  let url = new URI(window.path);
  if(!opts) return url.toString();

  let urlOpts = {
    limit: 11,
    offset: (opts.page - 1) * 10,
    'color[]': opts.colors
  };

  url.query(urlOpts);

  return url.toString();
}

export default retrieve;
