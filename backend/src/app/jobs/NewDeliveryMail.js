import Mail from '../../lib/Mail';

class NewDeliveryMail {
  get key() {
    return 'NewDeliveryMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova encomenda para entrega',
      template: 'newDelivery',
      context: {
        deliveryman_name: deliveryman.name,
        recipient_name: recipient.name,
        street_name: recipient.street,
        street_number: recipient.street_number,
        complement: recipient.complement,
        state: recipient.state,
        city: recipient.city,
        zip_code: recipient.zip_code,
      },
    });
  }
}

export default new NewDeliveryMail();
