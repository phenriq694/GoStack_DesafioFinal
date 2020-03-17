module.exports = {
  up: queryInterface => {
    return queryInterface.renameTable('deliveryman', 'deliverymen');
  },

  down: queryInterface => {
    return queryInterface.removeColumn('deliverymen', 'deliveryman');
  },
};
