const toArray = require('stream-to-array');
const { FileReader, SkillsWriter, SkillsErrorEnum } = require('./skills-kit-2.0');
const { AssureIdProvider } = require('./assure-id-provider');

exports.handler = async (event) => {    
    // Get Box Skills variables
    const filesReader = FilesReader(event.body);
    const skillsWriter = SkillsWriter(filesReader.getFileContext());
    const assureIdProvider = AssureIdProvider();
    // const { requestId, skillId, fileId, fileReadClient, fileWriteToken } = filesReader.getFileContext();

    // Save Processing Card
    await skillsWriter.saveProcessingCard();

    try {
        // Get File Content
        const contentStream = filesReader.getContentStream();

        // Get AssureID Metadata
        const assureIdMetadata = await assureIdProvider.getAssureIdMetadata(contentStream);

        // Create the Box Skills Cards metadata
        const cards = [];
        cards.push(skillsWriter.createTranscriptsCard(assureIdMetadata.issuer, null, 'ID Issuer Metadata'));
        cards.push(skillsWriter.createTranscriptsCard(assureIdMetadata.id_card, null, 'ID Metadata'));
        cards.push(skillsWriter.createTranscriptsCard(assureIdMetadata.id_holder, null, 'ID Holder Metadata'));
        
        // Save the new cards metadata
        console.log(`Created skills cards: ${cards}`);
        await skillsWriter.saveDataCards(cards);

    } catch (error) {
        console.error(`Skill processing failed for file: ${filesReader.getFileContext().fileId} with error: ${error.message}`);
        await skillsWriter.saveErrorCard(SkillsErrorEnum.UNKNOWN);

        // Delete the document instance from AssureId
        await assureIdProvider.deleteDocumentInstance(assureIdMetadata.docucment_intance_id);
    } finally {
        // Delete the document instance from AssureId
        await assureIdProvider.deleteDocumentInstance(assureIdMetadata.docucment_intance_id);

        return { 
            statusCode: 200,
            body: JSON.stringify({
                message: 'AssureID Skill Processing Finished!'
            })
        };
    }
};
