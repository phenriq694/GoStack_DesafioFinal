import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, isAfter, setHours } from 'date-fns';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';

class DeliveryController {
  async index(req, res) {
    const { deliveryman_id } = req.params;

    const deliverymanExists = Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const deliveries = await Order.findAll({
      where: { deliveryman_id, canceled_at: null, end_date: null },
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { deliveryman_id, order_id } = req.params;

    const order = await Order.findByPk(order_id);

    /**
     * Check if the order belogns to deliveryman
     */
    if (order.deliveryman_id !== Number(deliveryman_id)) {
      return res
        .status(400)
        .json({ error: 'This order does not belong to you' });
    }

    /**
     * Check withdrwal limit
     */
    const { count } = await Order.findAndCountAll({
      where: {
        deliveryman_id: req.params.deliveryman_id,
        start_date: null,
        signature_id: null,
      },
    });

    if (count > 5) {
      return res.status(400).json({ error: 'Withdrawal limit reached' });
    }

    /**
     * Check withdrawal date
     */
    const { start_date } = req.body;

    const parsedDate = parseISO(start_date);

    if (
      isBefore(parsedDate, setHours(startOfHour(new Date()), 8)) ||
      isAfter(parsedDate, setHours(startOfHour(new Date()), 18))
    ) {
      return res.status(400).json({
        error:
          'WithdraDrawal is only allowed between 8am and 6pm on the current day',
      });
    }

    order.start_date = parsedDate;

    await order.save();

    return res.json(order);
  }
  // async update(req, res) {
  //   const schema = Yup.object().shape({
  //     end_date: Yup.number().required(),
  //   });
  //   if (!(await schema.isValid(req.body))) {
  //     return res.status(400).json({ error: 'Validation fails' });
  //   }
  //   const { end_date } = req.body;
  //   const parsedDate = parseISO(end_date);
  //   const order = await Order.update({ end_date: parsedDate });
  //   return res.json(order);
  // }
}

export default new DeliveryController();
