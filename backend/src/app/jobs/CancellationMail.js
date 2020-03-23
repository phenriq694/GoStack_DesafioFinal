import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, deliveryProblem_description } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Cancelamento de entrega',
      template: 'cancellation',
      context: {
        deliveryman_name: deliveryman.name,
        recipient_name: recipient.name,
        street_name: recipient.street,
        street_number: recipient.street_number,
        complement: recipient.complement,
        state: recipient.state,
        city: recipient.city,
        zip_code: recipient.zip_code,
        deliveryProblem_description,
      },
    });
  }
}

export default new CancellationMail();
