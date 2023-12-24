export function isStringValid(param, paramName){
    if(!param){
        throw `Please provide ${paramName}`;
    }
    if(typeof param !== "string"){
        throw `${paramName} should be of type string only`;
    }
    param = param.trim();
    if(param.length === 0){
        throw `${paramName} can't just be an empty string`;
    }
    return param;
}
