import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';

class DeliveryProblemController {
  async index(req, res) {
    const deliveryProblems = await DeliveryProblem.findAll();

    return res.json(deliveryProblems);
  }

  async show(req, res) {
    const { order_id } = req.params;

    const order = await Order.findByPk(order_id);

    /**
     * Check if order exists
     */
    if (!order) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    const deliveryProblems = await DeliveryProblem.findByPk(order_id);

    /**
     * Check if order had any delivery problems
     */
    if (!deliveryProblems) {
      return res.status(400).json({ error: 'Order had no delivery problems' });
    }

    return res.json(deliveryProblems);
  }
}

export default new DeliveryProblemController();
