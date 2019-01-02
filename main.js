// Goal: display every Tesla model produced in 2018 with its EPA-rated range

// getEconomyForID - Gets EPA fuel economy data for a given model ID
const getEconomyForId = (modelId) => {
    return (
        axios.get(`https://www.fueleconomy.gov/ws/rest/vehicle/${modelId}`)
            .then(res => res.data)
    )
}

// getEconomyForModel - Gets EPA fuel economy data for a given year, make, and model.
// Some models have more than one ID (example: automatic and manual transmission),
// so the data is returned as an array.
const getEconomyForModel = (year, make, model) => (
    axios.get(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`)
        .then(res => {
            // menuItem has the id(s) associated with a given model
            let ids = res.data.menuItem

            // Make sure ids is an array; if only one id is associated with a model, menuItem is just an object
            if (!Array.isArray(ids)) {
                ids = [ids]
            }

            const idRequests = ids.map(id => getEconomyForId(id.value))

            // Resolve once data for all ids is received
            return Promise.all(idRequests)
        })
)

// getEconomyForMake - Gets EPA fuel economy data for a given year and make.
const getEconomyForMake = (year, make) => {
    return axios.get(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${make}`)
        .then(res => {
            let models = res.data.menuItem

            // If menuItem is a model object rather than an array, make it a single-element array
            if (!Array.isArray(models)) {
                models = [models]
            }

            const modelRequests = models.map(model => getEconomyForModel(year, make, model.value))
            
            // Once we have data for all models, return a flattened array of records
            return Promise.all(modelRequests).then(modelRecords => modelRecords.flat(1))
        })
}

getEconomyForMake(2018, 'Tesla').then(modelRecords => {
    // Sort by EPA-rated range (descending)
    modelRecords.sort((m1, m2) => m2.range - m1.range)

    const root = document.getElementById('root')

    // Show the name and range of each model
    modelRecords.forEach(modelRecord => {
        const name = document.createElement('h2')
        name.innerText = modelRecord.model

        const range = document.createElement('h4')
        range.innerText = `Range: ${modelRecord.range} miles`

        root.appendChild(name)
        root.appendChild(range)
    })
})
