import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import NewDeliveryMail from '../jobs/NewDeliveryMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll({
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { product, recipient_id, deliveryman_id } = req.body;

    /**
     * Check if recipient exists
     */
    const recipientExists = await Recipient.findByPk(recipient_id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    /**
     * Check if deliveryman exists
     */
    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const order = await Order.create({ product, recipient_id, deliveryman_id });

    /**
     * Send an e-mail to Deliveryman
     */
    await Queue.add(NewDeliveryMail.key, {
      deliveryman: deliverymanExists,
      recipient: recipientExists,
    });

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    /**
     * Check if order exists
     */
    const order = await Order.findByPk(req.params.order_id);

    if (!order) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    /**
     * Check if recipient exists
     */
    if (recipient_id) {
      const recipientExists = await Recipient.findByPk(recipient_id);

      if (!recipientExists) {
        return res.status(400).json({ error: 'Recipient does not exists' });
      }
    }

    /**
     * Check if deliveryman exists
     */
    if (deliveryman_id) {
      const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

      if (!deliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman does not exists' });
      }
    }

    await order.update(req.body);

    return res.json(order);
  }
}

export default new OrderController();
