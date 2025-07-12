
describe('Classe Config', () => {
  beforeEach(() => {
    // Imposta le env PRIMA di importare config
    process.env.KAFKA_BROKERS = 'a:9092,b:90902';
    process.env.KAFKA_BASE_TOPIC = 'topic';

    // Reset dei moduli per forzare un reload pulito
    jest.resetModules();
  });

  it('should user env variables', () => {
    const config = require('config');
    process.env.KAFKA_BROKERS = 'a:9092,b:90902';
    process.env.KAFKA_BASE_TOPIC = 'topic';
    expect(config.get("kafka.brokers")).toEqual(['a:9092','b:90902']);
    expect(config.get("kafka.fistPipelineTopic")).toEqual('topic');
  });
});
