const request = require('request-promise');

const ASSURE_ID_ENDPOINT = process.env.ASSURE_ID_ENDPOINT;
const ASSURE_ID_USERNAME = process.env.ASSURE_ID_USERNAME;
const ASSURE_ID_PASSWORD = process.env.ASSURE_ID_PASSWORD;
const ASSURE_ID_SUBSCRIPTION_ID = process.env.ASSURE_ID_SUBSCRIPTION_ID;
const credentials = Buffer.from(`${ASSURE_ID_USERNAME}:${ASSURE_ID_PASSWORD}`).toString('base64');


class AssureIdManager {
    /**
     * Get the AssureID subscription
     *
     * @returns {boolean} - Returns a boolean representing if the AssureID subscription is active or not
     */
    getSubscription() {
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
    }
    /**
     * Creates a AssureID document instance
     *
     * @returns {string} - The ID string representing the newly created document instance
     */
    createDocumentInstance() {
        return new Promise((resolve, reject) => {
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
        });
    }
    /**
     * Add the document image byte[] to the document intsance
     *
     * @param {string} documentInstanceId - The string ID representing the AssureID document instance
     * @param {byte[]} fileByteArray - The byte[] object for the Box file
     * @returns {boolean} - The boolean representing whether or no the image was successfully sent to the AssureID image endpoint
     */
    sendDocumentImage(documentInstanceId, fileByteArray) {
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
    }
    
    /**
     * Get the AssureID document instance results
     *
     * @param {string} documentInstanceId - The string ID representing the AssureID document instance
     * @returns {Object} documentResults - The JSON object presenting the processing results from AssureID
     */
    getDocumentInstanceResults(documentInstanceId) {
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
    }
    /**
     * Delent the document instance from AssureID
     *
     * @param {string} documentInstanceId - The string ID representing the AssureID document instance
     * @returns {boolean} - The boolean value that representing whether or the AssureID document instance has been deleted
     * @memberof AssureIdManager
     */
    deleteDocumentInstance(documentInstanceId) {
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
    }
}
module.exports = new AssureIdManager();