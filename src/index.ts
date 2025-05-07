import  express, { NextFunction, Request, Response }  from "express";
require('dotenv').config();
import cors from 'cors';
import swaggerUi, {SwaggerOptions} from 'swagger-ui-express';
import routes from "./routes/routes";
import HttpException from "./utils/http-exception";
import swaggerOptions from "./swagger.config";
import swaggerJSDoc from "swagger-jsdoc";
const router = express.Router();






// MIDDLEWARE
const app=express();
app.use(cors());
app.use(express.json());
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
})


app.use('/api',routes)
app.use("/.netlify/functions/app", router);
// app.use(express.static('public'));

app.get('/',(req:Request,res:Response)=>{
    res.json({status:'API is running'})
})
app.use('src/public', express.static('public'));


/* eslint-disable */
app.use((err: Error | HttpException, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500; // Default status code for internal server error
  let errorMessage: string | any = 'Internal Server Errors';
  console.log(err)
  
  if (err instanceof HttpException) {
      statusCode = err.errorCode; // If it's an HttpException, set status code from errorCode property
      errorMessage = err.message; // Set the error message from the HttpException
  }
  

  res.status(statusCode).json({ error: errorMessage }); // Sending error message along with status code
});
  
//start the server
app.listen(process.env.PORT || 8000,()=>{
    console.log(`server running on ${process.env.PORT || 8000}`)
})




