const { Client, Databases, ID, Query } = require('node-appwrite');

class AppwriteClient {
    constructor() {
        this.client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);
        
        this.databases = new Databases(this.client);
    }

    async addVocabulary(korean, japanese, source = '') {
        try {
            // Check for duplicates
            const existing = await this.databases.listDocuments(
                process.env.APPWRITE_DATABASE_ID,
                process.env.APPWRITE_COLLECTION_ID,
                [Query.equal('korean', korean)]
            );

            if (existing.total > 0) {
                console.log(`⏭️  Duplicate skipped: ${korean}`);
                return { status: 'duplicate', korean };
            }

            // Add new vocabulary
            const result = await this.databases.createDocument(
                process.env.APPWRITE_DATABASE_ID,
                process.env.APPWRITE_COLLECTION_ID,
                ID.unique(),
                {
                    korean,
                    japanese,
                    source
                }
            );

            console.log(`✅ Added: ${korean} → ${japanese}`);
            return { status: 'added', korean, japanese };

        } catch (error) {
            console.error(`❌ Error adding vocabulary: ${error.message}`);
            return { status: 'error', korean, error: error.message };
        }
    }

    async addSentence(korean, japanese, source = '') {
        try {
            // Check for duplicates by exact korean sentence match
            const existing = await this.databases.listDocuments(
                process.env.APPWRITE_DATABASE_ID,
                'sentences', // New collection ID
                [Query.equal('korean', korean)]
            );

            if (existing.total > 0) {
                console.log(`⏭️  Duplicate sentence skipped: ${korean.substring(0, 50)}...`);
                return { status: 'duplicate', korean };
            }

            // Add new sentence
            const result = await this.databases.createDocument(
                process.env.APPWRITE_DATABASE_ID,
                'sentences', // New collection ID
                ID.unique(),
                {
                    korean,
                    japanese,
                    source
                }
            );

            console.log(`✅ Added sentence: ${korean.substring(0, 50)}...`);
            return { status: 'added', korean, japanese };

        } catch (error) {
            console.error(`❌ Error adding sentence: ${error.message}`);
            return { status: 'error', korean, error: error.message };
        }
    }
}

module.exports = AppwriteClient;
