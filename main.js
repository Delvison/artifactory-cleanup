let request = require('request')
var prompt = require('prompt')

let artifactory_url = "http://nyc-artfc-d01.jcrew.com/artifactory/"
let artifactory_host = "nyc-artfc-d01.jcrew.com"
let artifactory_user =  process.env.ARTFC_USER // env variable
let artifactory_password =  process.env.ARTFC_PASSWORD // env variable

let exec_aql = (aql) => {
    return new Promise( (resolve, reject) => {
      let options = {
        url: artifactory_url+'api/search/aql',
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': 'Basic ' + new Buffer(artifactory_user + ':' + artifactory_password).toString('base64')
        },
        body: aql
      };

      request.post(options, (err, res, body) => {
        if (err) {
          console.log("Failed to execute aql: "+aql)
          return reject(err)
        }
        try {
          let results = JSON.parse(body).results
          if (results.length == 0) return reject("No results found.")
          resolve(results)
        } catch (err) {
          console.log(body)
          reject(err)
        }
      });
    })
}

let exec_delete = (url) => {
  return new Promise((resolve,reject) => {
      let options = {
        url: url,
        method: 'DELETE',
        headers: {
          'Authorization': 'Basic ' + new Buffer(artifactory_user + ':' + artifactory_password).toString('base64')
        }
      };

    request.delete(options, (err, res, body) => {
      if (err) return reject(err)
      return resolve(body)
    })

  })
}

let usage = () => {
  console.log("Usage: "+process.argv[0]+" "+process.argv[1]+" <artifactory repo> <date upper bound (YYYY-MM-dd)>")
}

let decide_delete = (urls) => {
  filtered_urls = urls.filter((x)=>{
    return x.indexOf("noarch") > 1
  })
  filtered_urls.map((x) => { console.log(x) })
  console.log("\nAre you sure you want to delete these "+filtered_urls.length+ " file(s) [Y/n]?")
  prompt.start()
  prompt.get(['decision'], (err, result) => {
    if (err) process.exit(1)
    console.log(result.decision)

    if (result.decision == "y" || result.decision == "")
    {
      let delete_promises = filtered_urls.map((url) => { return exec_delete(url) })
      Promise.all(delete_promises)
        .then(() => {
          console.log("All deleted.")
        })
        .catch((err) => {
          console.log(err)
        })
    } else {
      console.log("nothing deleted.")
    }
  })
}

let args = process.argv.slice(2);
if (args.length != 2) {
  usage() 
  process.exit(1);
}
let repo = args[0]
let date = args[1]

console.log("Artifactory cleanup script...")
let post_data = 'items.find( { "type":"file", "$and": [ {"created": {"$lte": "'+date+'"} }, {"repo":{"$eq":"'+repo+'"} } ] }) .include("name","created","path","repo","size") .sort({"$desc":["created"]})'

exec_aql(post_data)
  .then((result) => {
    //console.log(result)
    let urls = result.map((x) => {
      return artifactory_url + x.repo +"/"+x.path+"/"+x.name
    })
    return decide_delete(urls)
  })
  .catch((err) => {
    console.log(err)
  })
