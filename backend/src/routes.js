import { Router } from 'express';
import multer from 'multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import OrderController from './app/controllers/OrderController';
import DeliveryController from './app/controllers/DeliveryController';
import OrderDeliveredController from './app/controllers/OrderDeliveredController';

import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const upload = multer(multerConfig);

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.get('/deliveryman/:deliveryman_id/deliveries', DeliveryController.index);
routes.get(
  '/deliveryman/:deliveryman_id/delivered',
  OrderDeliveredController.index
);

routes.use(authMiddleware);

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:recipient_id', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/deliverymen', DeliverymanController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen/:deliveryman_id', DeliverymanController.update);
routes.delete('/deliverymen/:deliveryman_id', DeliverymanController.delete);

routes.post('/orders', OrderController.store);

export default routes;
