import {SwaggerOptions} from "swagger-ui-express";
import swaggerAutogen from "swagger-autogen";

const swaggerOptions: SwaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Eccentrix wear',
            version: '1.0.0',
            description: 'Eccentrix wear API Information',
            contact: {
                name: 'Varun K',
                email: 'varunkodi3111@gmail.com',
            },
        },
        servers: [
            {
                url: `${process.env.APPLICATION_DEPLOYMENT_URL}/api`, // Deployed server URL
                description: 'Deployed production server'
            },
            {
                url: `http://localhost:${process.env.PORT}/api`, // Local server
                description: 'Local development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/controllers/*.ts'], // Specify the path where your route files are
};

export default swaggerOptions;
