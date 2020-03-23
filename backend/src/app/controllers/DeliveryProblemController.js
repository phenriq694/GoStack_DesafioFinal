import * as Yup from 'yup';

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

    const deliveryProblems = await DeliveryProblem.findAll({
      where: { order_id },
    });

    /**
     * Check if order had any delivery problems
     */
    if (!deliveryProblems) {
      return res.status(400).json({ error: 'Order had no delivery problems' });
    }

    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { order_id } = req.params;
    const { description } = req.body;

    const order = await Order.findByPk(order_id);

    /**
     * Check if order exists
     */
    if (!order) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    const deliveryProblem = await DeliveryProblem.create({
      order_id,
      description,
    });

    return res.json(deliveryProblem);
  }
}

export default new DeliveryProblemController();
