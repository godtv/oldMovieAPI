//
// let { PythonShell } = require('python-shell')
//
//
// module.exports = {
//     callName: (req, res) => {
//
//
//         let options = {
//             mode: 'text',
//             pythonOptions: ['-u'], // get print results in real-time
//
//             args:
//                 [
//                     req.query.name,
//                     req.query.from
//                 ]
//
//         };
//
//
//         PythonShell.run("./pythonScript/hello.py", options, (err, data) => {
//             if (err) {
//                 res.json(err)
//                 return ;
//             }
//             const parsedString = JSON.parse(data)
//
//             res.json(parsedString)
//         })
//
//     }
//
//
// };
//



let { PythonShell } = require('python-shell')

function runPy(req){
    return new Promise(async function(resolve, reject){
        let options = {
            mode: 'text',
            pythonOptions: ['-u'], // get print results in real-time

            args:
                [
                    req.query.name,
                    req.query.from
                ]
        };

        await PythonShell.run('./pythonScript/hello.py', options, function (err, results) {
            //On 'results' we get list of strings of all print done in your py scripts sequentially.
            if (err) {
                throw err;
            }
            console.log(results[0]);
            resolve(results[0])
        });
    })


}


function pyCounter(req) {
    return new Promise(async function (resolve, reject) {
        let  options = {
            mode: 'text',
            pythonOptions: ['-u'],
            args:  req.body.data
        };


            await PythonShell.run('./pythonScript/counterPython.py', options, function (err, results) {
                //On 'results' we get list of strings of all print done in your py scripts sequentially.
                if (err) {
                    throw err;
                }
                console.log('results: %j', results[0]);
                resolve(results)
            });
        })



}

module.exports = {
    callName: (req, res) => {

        new Promise(async  (resolve, reject) => {
            let r = await  runPy(req)
            res.json(JSON.parse(r))
        })

    },
    countArray: (req, res) => {
        new Promise(async  (resolve, reject) => {
            let r = await  pyCounter(req)
            res.json(r)
        })


        // console.log('GOGOGO');
        //
        //
        // let empty = []
        // for (let i = 0; i < req.body.data.length; i++) {
        //     let result = req.body.data[i];
        //     empty.push(result)
        //     console.log(result)
        // }
        //
        //
        // let  options = {
        //     mode: 'text',
        //     pythonOptions: ['-u'],
        //     args:  req.body.data
        // };
        //
        // PythonShell.run('./pythonScript/counterPython.py', options, function (err, results) {
        //     if (err) throw err;
        //     // results is an array consisting of messages collected during execution
        //     console.log('results: %j', results[0]);
        // });

    },


};


