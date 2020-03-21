import { Op } from 'sequelize';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';

class OrderDeliveredController {
  async index(req, res) {
    const { deliveryman_id } = req.params;

    const deliverymanExists = Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const deliveries = await Order.findAll({
      where: {
        deliveryman_id,
        signature_id: { [Op.not]: null },
      },
    });

    return res.json(deliveries);
  }
}

export default new OrderDeliveredController();
