/*Debaitable if this is nessesarry*/
let endPoints = {};

let add = (endPoint, callback) => { endPoints[endPoint] = callback; }

let getEndPoint = (endPoint) => { return endPoints[endPoint]; }

let hasEndPoint = (endPoint) => { return (endPoint in endPoints); }

module.exports = {
    addEndPoint: add,
    getEndpoint: getEndPoint,
    hasEndPoint: hasEndPoint
}