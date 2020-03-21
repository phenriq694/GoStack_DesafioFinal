import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import Mail from '../../lib/Mail';

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
    await Mail.sendMail({
      to: `${deliverymanExists.name} <${deliverymanExists.email}>`,
      subject: 'Nova encomenda para entrega',
      template: 'newDelivery',
      context: {
        deliveryman_name: deliverymanExists.name,
        recipient_name: recipientExists.name,
        street_name: recipientExists.street,
        street_number: recipientExists.street_number,
        complement: recipientExists.complement,
        state: recipientExists.state,
        city: recipientExists.city,
        zip_code: recipientExists.zip_code,
      },
    });

    return res.json(order);
  }
}

export default new OrderController();
