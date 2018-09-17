const BoxManager = require('./box-manager');
const AssureIdManager = require('./assure-id-manager');

exports.handler = async (event) => {    
    // Get Box Skills variables
    const body = JSON.parse(event.body);
    console.log('Found body: ', body);
    const { id, token, source, skill } = body;

    // Get Box client with the item_read access token
    const itemReadBoxClient = BoxManager.getBoxClient(token.read.access_token);

    // Get file byte array
    const fileByteArray = await BoxManager.getFileByteArray(itemReadBoxClient, source.id);
    
    // If Box file byte array length is greater than zero, continue 
    if(fileByteArray.length > 0) {
        // Get AssureId subscription
        const isSubscriptionActive = await AssureIdManager.getSubscription();
           
       // If AssureId is active, continue     
        if(isSubscriptionActive) {
            // Create AssureId document instance
            const documentInstanceId = await AssureIdManager.createDocumentInstance();
            
            // If AssureId document instance is not undefined, continue
            if(documentInstanceId) {
                const postImageSuccessful = await AssureIdManager.sendDocumentImage(documentInstanceId, fileByteArray);
                
                // If posting the image to the AssureId document instance is successful, continue
                if(postImageSuccessful) {
                    const documentInstanceResults = await AssureIdManager.getDocumentInstanceResults(documentInstanceId);
                    
                    // If document instance results are available, continue
                    if(documentInstanceResults) {
                        // Create Skills cards
                        const assureIdMetadata = BoxManager.createSkillsCards(id, skill.id, documentInstanceResults);

                        // Get the skills metadata temlate to see if we should add or update metadata
                        let skillsMetadata = await BoxManager.getSkillsMetadataTemplate(itemReadBoxClient, source.id);

                        // Get a Box client with the item_upload access token
                        const itemWriteBoxClient = BoxManager.getBoxClient(token.write.access_token);

                        // Check if the skills metadata template exists on the file already
                        if(skillsMetadata === false) {
                            // Add new metadata
                            const addMetadataResponse = await BoxManager.addMetadata(itemWriteBoxClient, source.id, assureIdMetadata);
                            
                            // 409 was thrown while trying to add metadta, now we need to try and update metadata instead
                            if(addMetadataResponse === 409) {
                                skillsMetadata = await BoxManager.getSkillsMetadataTemplate(itemReadBoxClient, source.id);
                                await BoxManager.updateMetadata(itemWriteBoxClient, source.id, assureIdMetadata, skillsMetadata);
                            }
                        }
                        else {
                            // Update existing metatadata
                            await BoxManager.updateMetadata(itemWriteBoxClient, source.id, assureIdMetadata, skillsMetadata);
                        }

                        // Delete the document instance from AssureId
                        const deleteDocumentInstanceResponse = await AssureIdManager.deleteDocumentInstance(documentInstanceId);
                    }
                }
            }
        }
    }

    return { 
        statusCode: 200,
        body: JSON.stringify({
            message: 'AssureID Skill Processing Finished!'
        })
    };
};
