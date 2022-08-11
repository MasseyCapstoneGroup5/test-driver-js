
// Language agnostic testing
async function convertToJS(sdkMethod){
    // input the SDK
    // find out language and convert to javascript object
    try {
        const sdk_data = JSON.parse(sdk);
    } catch (error) {
    //if data is not processed - throw an error.
        console.log(error);
    }
    // return converted SDK
}
