

let exportedMethods = {
    temporaryStorage: {},
    storeData: function(key, value) {
        if(!this.temporaryStorage[key]){
            this.temporaryStorage[key] = []
        }
        this.temporaryStorage[key].push(value);
        return true;
      },
      
      // Function to retrieve data
      getData: function(key) {
        return this.temporaryStorage[key] || [];
      },
      clearData: function(key){
        this.temporaryStorage[key] = [];
        return true;
      }
}
export default exportedMethods;