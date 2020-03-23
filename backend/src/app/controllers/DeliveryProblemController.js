import * as Yup from 'yup';

import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

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

  async delete(req, res) {
    const { order_id } = req.params;

    const order = await Order.findByPk(order_id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'street_number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
    });

    /**
     * Check if order exists
     */
    if (!order) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    order.canceled_at = new Date();

    await order.save();

    const deliveryProblem = await DeliveryProblem.findAll({
      where: { order_id },
    });

    const allDeliveryProblemDescription = deliveryProblem.map(
      dp => dp.description
    );

    /**
     * Send an e-mail to Deliveryman
     */
    await Queue.add(CancellationMail.key, {
      deliveryman: order.deliveryman,
      recipient: order.recipient,
      deliveryProblem_description: allDeliveryProblemDescription,
    });

    return res.json(order);
  }
}

export default new DeliveryProblemController();
