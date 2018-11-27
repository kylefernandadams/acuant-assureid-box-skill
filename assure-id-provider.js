const request = require('request-promise');

const ASSURE_ID_ENDPOINT = process.env.ASSURE_ID_ENDPOINT;
const ASSURE_ID_USERNAME = process.env.ASSURE_ID_USERNAME;
const ASSURE_ID_PASSWORD = process.env.ASSURE_ID_PASSWORD;
const ASSURE_ID_SUBSCRIPTION_ID = process.env.ASSURE_ID_SUBSCRIPTION_ID;
const credentials = Buffer.from(`${ASSURE_ID_USERNAME}:${ASSURE_ID_PASSWORD}`).toString('base64');


AssureIdProvider.prototype.getAssureIdMetadata = function getAssureIdMetadata(contentStream) {
    return new Promise((resolve, reject) => {
        // Get AssureId subscription
        const isSubscriptionActive = getSubscription();
            
        // If AssureId is active, continue     
        if(isSubscriptionActive) {
            // Create AssureId document instance
            const documentInstanceId = createDocumentInstance();
            
            // If AssureId document instance is not undefined, continue
            if(documentInstanceId) {
                const postImageSuccessful = sendDocumentImage(documentInstanceId, fileByteArray);
                
                // If posting the image to the AssureId document instance is successful, continue
                if(postImageSuccessful) {
                    const documentInstanceResults = getDocumentInstanceResults(documentInstanceId);
                    
                    let assureIDMetadata = {};
                    assureIDMetadata.issuer = getIssuerEntries(documentInstanceResults);
                    assureIDMetadata.id_card = getIDCardEntries(documentInstanceResults);
                    assureIDMetadata.id_holder = getIDHolderEntries(documentInstanceResults);
                    assureIDMetadata.docucment_intance_id = documentInstanceId;
                    // Return AssureID metadata
                    resolve(assureIDMetadata);
                }
            }
        }
    });
};

const getIssuerEntries = function getIssuerEntries(documentInstanceResults) {
    // Create Issuer entries
    const { ClassName, IssueType, IssuerCode, IssuerName, Name } = documentInstanceResults.Classification.Type;
    let issuerEntries = [];
    if(ClassName) {
        issuerEntries.push({
            type: 'text',
            text: `ID Class: ${ClassName}` 
        });
    }
    
    if(IssueType) {
        issuerEntries.push({
            type: 'text',
            text: `ID Type: ${IssueType}` 
        });
    }
    
    if(Name) {
        issuerEntries.push({
            type: 'text',
            text: `ID Name: ${Name}` 
        });
    }
    
    if(IssuerName) {
        issuerEntries.push({
            type: 'text',
            text: `Issuer Name: ${IssuerName}` 
        });
    }
    
    if(IssuerCode) {
        issuerEntries.push({
            type: 'text',
            text: `Issuer Code: ${IssuerCode}` 
        });
    }
    return issuerEntries;
};

const getIDCardEntries = function getIDCardEntries(documentInstanceResults) {
    // Create ID Metadata card
    const dataFieldsArray = documentInstanceResults.Fields;
    let idFieldEntries = [];
    
    // Add ID Metadata elements
    const controlNumber = _.filter(dataFieldsArray, ({Name}) => Name === 'Control Number')[0];
    if(controlNumber) {
        idFieldEntries.push({
            type: 'text',
            text: `Control Number: ${controlNumber.Value}`
        });
    }
    
    // Get the document number
    const documentNumber = _.filter(dataFieldsArray, ({Name}) => Name === 'Document Number')[0];
    if(documentNumber) {
        idFieldEntries.push({
            type: 'text',
            text: `Document Number: ${documentNumber.Value}`
        });
    }
    
    // Get the issue date
    const issueDateString = _.filter(dataFieldsArray, ({Name}) => Name === 'Issue Date')[0];
    if(issueDateString) {
        const issueDateValue = issueDateString.Value;
        const issueDateUnix = issueDateValue.substring(issueDateValue.lastIndexOf('(') + 1, issueDateValue.lastIndexOf(')')).slice(0, -3);
        const issueDate = moment.unix(issueDateUnix).format('MM-DD-YYYY');
        idFieldEntries.push({
            type: 'text',
            text: `Issue Date: ${issueDate}`
        });
    }
    
    // Get the expiration date
    const expDateString = _.filter(dataFieldsArray, ({Name}) => Name === 'Expiration Date')[0];
    if(expDateString) {
        const expDateValue = expDateString.Value;
        const expDateUnix = expDateValue.substring(expDateValue.lastIndexOf('(') + 1, expDateValue.lastIndexOf(')')).slice(0, -3);
        const expDate = moment.unix(expDateUnix).format('MM-DD-YYYY');
        idFieldEntries.push({
            type: 'text',
            text: `Expiration Date: ${expDate}`
        });
    }

    return idFieldEntries;
};

const getIDHolderEntries = function getIDHolderEntries(documentInstanceResults) {
    // Create ID Holder Metadata card
    let holderFieldntries = [];

    // Add ID Holder Metadata
    const firstName = _.filter(dataFieldsArray, ({Name}) => Name === 'Given Name')[0];
    if(firstName) {
        holderFieldntries.push({
            type: 'text',
            text: `First Name: ${firstName.Value}`
        });
    }
    
    // Get the last name
    const lastName = _.filter(dataFieldsArray, ({Name}) => Name === 'Surname')[0];
    if(lastName) {
        holderFieldntries.push({
            type: 'text',
            text: `Last Name: ${lastName.Value}`
        });
    }

    // Get the birth date
    const birthDateString = _.filter(dataFieldsArray, ({Name}) => Name === 'Birth Date')[0];
    if(birthDateString) {
        const birthDateValue = birthDateString.Value;
        const birthDateUnix = birthDateValue.substring(birthDateValue.lastIndexOf('(') + 1, birthDateValue.lastIndexOf(')')).slice(0, -3);
        const birthDate = moment.unix(birthDateUnix).format('MM-DD-YYYY');
        holderFieldntries.push({
            type: 'text',
            text: `Birth Date: ${birthDate}`
        });
    }
    
    // Get the gender
    const gender = _.filter(dataFieldsArray, ({Name}) => Name === 'Sex')[0];
    if(gender) {
        holderFieldntries.push({
            type: 'text',
            text: `Gender: ${gender.Value}`
        });
    }
    
    // Get the address
    const address = _.filter(dataFieldsArray, ({Name}) => Name === 'Address')[0];
    if(address) {
        holderFieldntries.push({
            type: 'text',
            text: `Address: ${address.Value}`
        });
    }

    // Get the eye color
    const eyeColor = _.filter(dataFieldsArray, ({Name}) => Name === 'Eye Color')[0];
    if(eyeColor) {
        holderFieldntries.push({
            type: 'text',
            text: `Eye Color: ${eyeColor.Value}`
        });
    }
    
    // Get the height
    const height = _.filter(dataFieldsArray, ({Name}) => Name === 'Height')[0];
    if(height) {
        holderFieldntries.push({
            type: 'text',
            text: `Height: ${height.Value}`
        });
    }

    return holderFieldntries;
};

/**
 * Get the AssureID subscription
 *
 * @returns {boolean} - Returns a boolean representing if the AssureID subscription is active or not
 */
const getSubscription = function getSubscription() {
    return new Promise((resolve, reject) => {
        // AssureID Subscription Endpoint
        const subscriptionUrl = `${ASSURE_ID_ENDPOINT}/AssureIDService/Subscriptions`;

        // Request options
        const options = {
            uri: subscriptionUrl,
            method: 'GET',
            headers: { 
                'Accept': 'application/json',
                'Authorization': `Basic ${credentials}`
            },
            json: true
        };
        
        // Issue a GET request for the AssureID subscriptions
        request(options)
        .then(subscriptions => {
            // Check if the subscriptions array has values
            if(subscriptions.length > 0) {
                // Get the Id and IsActive object
                const { Id, IsActive } = subscriptions[0];
                console.log('Found subscriptions response: ', subscriptions);
                
                // If the the Id and IsActive variables are found, return true. Else return false
                if(Id === ASSURE_ID_SUBSCRIPTION_ID && IsActive){
                    console.log('Subscription id matches and is active!!!');
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }
        })
        .catch(err => {
            console.log('Failed to get AssureId subscriptions: ', err);
            reject();
        });
    });
};

/**
 * Creates a AssureID document instance
 *
 * @returns {string} - The ID string representing the newly created document instance
 */
const createDocumentInstance = function createDocumentInstance() {
    return new Promise((resolve, reject) => {
        // Get AssureId subscription
        const isSubscriptionActive = getSubscription();
           
       // If AssureId is active, continue     
        if(isSubscriptionActive) {
            // AssureID Document Instance endpoint
            const postDocInstanceUrl = `${ASSURE_ID_ENDPOINT}/AssureIDService/Document/Instance`;

            // Request options
            const options = {
                    uri: postDocInstanceUrl,
                    method: 'POST',
                    headers: { 
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${credentials}`
                    },
                    body: {
                        'SubscriptionId': ASSURE_ID_SUBSCRIPTION_ID,
                        'ImageCroppingExpectedSize': 0,
                        'ImageCroppingMode': 1,
                        'ManualDocumentType': null,
                        'ProcessMode': 0,
                        'Device': {
                            'HasContactlessChipReader': false,
                            'HasMagneticStripeReader': false,
                            'SerialNumber': 'xxx',
                            'Type': {
                                'Manufacturer': 'Box',
                                'Model': 'Box Skills',
                                'SensorType': 0
                            }
                        },
                        'AuthenticationSensitivity': 0,
                        'ClassificationMode': 0
                    },
                    json: true
                };
                
            // Issue a POST request to create an AssureID document instance 
            request(options)
            .then(documentInstanceId => {
                console.log('Found document instance response: ', documentInstanceId);
                // Return a document instance ID string
                resolve(documentInstanceId);
            })
            .catch(err => {
                console.log('Failed to get AssureId document instance id: ', err);
                reject();
            });
        }
    });
};

/**
 * Add the document image byte[] to the document intsance
 *
 * @param {string} documentInstanceId - The string ID representing the AssureID document instance
 * @param {byte[]} fileByteArray - The byte[] object for the Box file
 * @returns {boolean} - The boolean representing whether or no the image was successfully sent to the AssureID image endpoint
 */
const sendDocumentImage = function sendDocumentImage(documentInstanceId, fileByteArray) {
    return new Promise((resolve, reject) => {
        // The AssureID document image endpoint
        const postDocumentImageUrl = `${ASSURE_ID_ENDPOINT}/AssureIDService/Document/${documentInstanceId}/Image`;
        
        // Request options
        const options = {
                uri: postDocumentImageUrl,
                method: 'POST',
                qs: {
                    side: 0,
                    light: 0,
                    metrics: false
                },
                headers: {
                    'Authorization': `Basic ${credentials}`
                },
                body: fileByteArray
            };
            
            // Issue a POST request to send the document image byte[] to AssureID and return a boolean
            request(options)
            .then(sendImageResponse => {
                console.log('Successfully posted image to AssureId document instance!');
                resolve(true);
            })
            .catch(err => {
                console.log('Failed to post image to AssureId document instance: ', err);
                resolve(false);
            });
    });
};

/**
 * Get the AssureID document instance results
 *
 * @param {string} documentInstanceId - The string ID representing the AssureID document instance
 * @returns {Object} documentResults - The JSON object presenting the processing results from AssureID
 */
const getDocumentInstanceResults = function getDocumentInstanceResults(documentInstanceId) {
    return new Promise((resolve, reject) => {
        // AssureID Document Instance endpoint
        const getDocumentInstanceUrl = `${ASSURE_ID_ENDPOINT}/AssureIDService/Document/${documentInstanceId}`;
        
        // Request options
        const options = {
            uri: getDocumentInstanceUrl,
            method: 'GET',
            headers: { 
                'Accept': 'application/json',
                'Authorization': `Basic ${credentials}`
            },
            json: true
        };
        
        // Issue a GET request to get the document instance results from AssureID
        request(options)
        .then(documentResults => {
            console.log('Found AssureId document instance results: ', documentResults);
            resolve(documentResults);
        })
        .catch(err => {
            console.log('Failed to get document instance results', err);
            reject();
        });
    });
};

/**
 * Delent the document instance from AssureID
 *
 * @param {string} documentInstanceId - The string ID representing the AssureID document instance
 * @returns {boolean} - The boolean value that representing whether or the AssureID document instance has been deleted
 * @memberof AssureIdManager
 */
AssureIdProvider.prototype.deleteDocumentInstance = function deleteDocumentInstance(documentInstanceId) {
    return new Promise((resolve, reject) => {
        // AssureID delete document instance endpoint
        const deleteDocumentInstanceUrl = `${ASSURE_ID_ENDPOINT}/AssureIDService/Document/${documentInstanceId}`;
        
        // Request options
        const options = {
            uri: deleteDocumentInstanceUrl,
            method: 'DELETE',
            headers: { 
                'Accept': 'application/json',
                'Authorization': `Basic ${credentials}`
            },
            json: true
        };
        
        // Issue a DELETE request to delete the document instance from AssureID
        request(options)
        .then(deleteDocumentInstanceResults => {
            console.log('Successfully deleted AssureId document instance!');
            resolve(true);
        })
        .catch(err => {
            console.log('Failed to delete document instance: ', err);
            reject(false);
        });
    });
};

module.exports = {
    AssureIdProvider
};