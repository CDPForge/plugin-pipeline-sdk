describe('Classe Config', () => {
  beforeEach(() => {
    // Imposta le env PRIMA di importare config
    process.env.KAFKA_BROKERS = 'a:9092,b:90902';
    process.env.PIPELINEMANAGER_FIRST_TOPIC = 'topic';

    // Reset dei moduli per forzare un reload pulito
    jest.resetModules();
  });

  it('should user env variables', () => {
    const config = require('config');
    expect(config.get("kafka.brokers")).toEqual(['a:9092','b:90902']);
    expect(config.get("pipelinemanager.first_topic")).toEqual('topic');
  });
});
