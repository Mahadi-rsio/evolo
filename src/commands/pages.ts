import { listPages } from './../api/projectApi.js'

(async () => {
    const data = await listPages()
    console.log(data);

})()
