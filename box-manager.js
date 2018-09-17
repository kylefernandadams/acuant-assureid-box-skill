const _ = require('lodash');
const BoxSDK = require('box-node-sdk');
const toArray = require('stream-to-array');
const moment = require('moment');

class BoxManager {

    /**
     * Get a Box client instance
     *
     * @param {string} accessToken - the access token used to get a Box basic client 
     * @returns {Object} - Box Basic Client instance
     */
    getBoxClient(accessToken) {
        return BoxSDK.getBasicClient(accessToken);
    }
    
    /**
     * Get Byte Array from a file
     *
     * @param {Object} client - Box Basic Client
     * @param {string} fileId - The file ID used to get the read stream 
     * @returns {byte[]} fileByteArray - The byte[] from the file read stream
     */
    getFileByteArray(client, fileId) {
        return new Promise((resolve, reject) => {
            
            client.files.getReadStream(fileId)
            .then(fileStream => {
                return toArray(fileStream);
            })
            .then(fileByteArray => {
                console.log('File byte array length: ', fileByteArray.length);
                resolve(fileByteArray);
            })
            .catch(err => {
                console.log('Failed to get file byte array: ', err);
                reject();
            });
        });
    }
    
    /**
     * Create the Box Skills Cards
     *
     * @param {string} invocationId - The Box skills invocation ID
     * @param {string} skillId - The Box skills ID
     * @param {Object} documentInstanceResults - The JSON object representing the AssureID document instance results 
     * @returns {Object} - The JSON object representing the Box Skills metadata value 
     */
    createSkillsCards(invocationId, skillId, documentInstanceResults) {
            let cards = [];
            
            // Create Classification card
            const classificationCard = {
                type: 'skill_card',
                skill_card_type: 'transcript',
                skill_card_title: {
                    message: 'ID Issuer Metadata'
                },
                skill: {
                    type: 'service',
                    id: skillId
                },
                invocation: {
                    type: 'skill_invocation',
                    id: invocationId
                }
            };
            
            // Add Classification card metadata
            const { ClassName, IssueType, IssuerCode, IssuerName, Name } = documentInstanceResults.Classification.Type;
            let classificationEntries = [];
            if(ClassName) {
                classificationEntries.push({
                    type: 'text',
                    text: `ID Class: ${ClassName}` 
                });
            }
            
            if(IssueType) {
                classificationEntries.push({
                    type: 'text',
                    text: `ID Type: ${IssueType}` 
                });
            }
            
            if(Name) {
                classificationEntries.push({
                    type: 'text',
                    text: `ID Name: ${Name}` 
                });
            }
            
            if(IssuerName) {
                classificationEntries.push({
                    type: 'text',
                    text: `Issuer Name: ${IssuerName}` 
                });
            }
            
            if(IssuerCode) {
                classificationEntries.push({
                    type: 'text',
                    text: `Issuer Code: ${IssuerCode}` 
                });
            }
            
            // Add ID Classification Metadata entries array and push to cards array
            classificationCard.entries = classificationEntries;
            cards.push(classificationCard);
            
            // Create ID Metadata card
            const dataFieldsArray = documentInstanceResults.Fields;
            let idFieldEntries = [];
            const idCard = {
                type: 'skill_card',
                skill_card_type: 'transcript',
                skill_card_title: {
                    message: 'ID Metadata'
                },
                skill: {
                    type: 'service',
                    id: skillId
                },
                invocation: {
                    type: 'skill_invocation',
                    id: invocationId
                }
            };

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
            
            // Add ID Metadata entries array and push to cards array
            idCard.entries = idFieldEntries;
            cards.push(idCard);

            // Create ID Holder Metadata card
            let holderFieldntries = [];
            const idHolderCard = {
                type: 'skill_card',
                skill_card_type: 'transcript',
                skill_card_title: {
                    message: 'ID Holder Metadata'
                },
                skill: {
                    type: 'service',
                    id: skillId
                },
                invocation: {
                    type: 'skill_invocation',
                    id: invocationId
                }
            };

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
            
            // Add ID Holder Metadata entries array and push to cards array
            idHolderCard.entries = holderFieldntries;
            cards.push(idHolderCard);

            console.log('Skills card json: ', JSON.stringify({ cards: cards}, null, 2));
            return { cards: cards};
    }

    /**
     * Get the Box Skills Cards metadata template
     *
     * @param {Object} client - Box Basic Client
     * @param {string} fileId - The file ID in which to get the Box Skills Cards metadata template 
     * @returns {Object} skillsMetadata - The object representing the Box metadata tempate
     */
    getSkillsMetadataTemplate(client, fileId) {
        return new Promise((resolve, reject) => {
            // Get the box skills metadata
            client.files.getMetadata(fileId, client.metadata.scopes.GLOBAL, 'boxSkillsCards')
            .then(skillsMetadata => {
                console.log('Found skills metadata template: ', skillsMetadata);
                resolve(skillsMetadata);
            })
            .catch(err => {
                console.log('Skills metadata template does not exist!', err);
                resolve(false);
            });
        });
    }

    /**
     * Add metadata to the Box Skills Cards metadata template
     *
     * @param {Object} client - Box Basic Client
     * @param {string} fileId - The file ID in which to add metadata 
     * @param {Object} skillsMetadata - The JSON object representing the Box Skills Cards metadata value
     * @returns {Object} - The Object presenting the metadata added to a given file
     */
    addMetadata(client, fileId, skillsMetadata) {
        return new Promise((resolve, reject) => {
            // Add the boxSkillsCard metadata template to the file
            client.files.addMetadata(fileId, client.metadata.scopes.GLOBAL, 'boxSkillsCards', skillsMetadata)
            .then(addMetadataResponse => {
                console.log('Successfully added metadata: ', addMetadataResponse);
                resolve(addMetadataResponse);
            })
            .catch(err => {
                console.log('Failed to add metadata', err);
                if(err.statusCode === 409) {
                    resolve(409);
                } 
                else {
                    reject();
                }
            });
        });
    }

    /**
     * Update the Box Skills Cards metadata template
     *
     * @param {Object} client - Box Basic Client
     * @param {string} fileId - The file ID in which to add metadata 
     * @param {Object} skillsMetadata - The JSON object representing the new metadata values to update on the Box Skills Cards metadata template instance
     * @param {Object} skillsMetadata - The JSON object representing the Box Skills Cards metadata value
     * @returns {Object} - The Object presenting the metadata updated on a given file
     */
    updateMetadata(client, fileId, assureIdMetadata, skillsMetadata) {
        return new Promise((resolve, reject) => {
            // Loop through the skills cards and add it to the existing metadata. 
            assureIdMetadata.cards.forEach(card => {
                // If a card with the same title already exists, replace it with the newly created card
                const filteredCards = skillsMetadata.cards.filter(({skill_card_title}) => skill_card_title.message !== card.skill_card_title.message);
                skillsMetadata.cards = filteredCards;
                skillsMetadata.cards.push(card);
            });

            // Create the metadata update operaction json
            const metadataUpdates = [{
                op: 'replace', path: '/cards', value: skillsMetadata.cards
            }];

            // Update the existing metadata with the changes
            client.files.updateMetadata(fileId, client.metadata.scopes.GLOBAL, 'boxSkillsCards', metadataUpdates)
            .then(updateMetadataResponse => {
                console.log('Successfully updated metadata: ', updateMetadataResponse);
                resolve(updateMetadataResponse);
            })
            .catch(err => {
                console.log('Failed to updated metadata', err);
                reject();
            });
        });
    }
}

module.exports = new BoxManager();