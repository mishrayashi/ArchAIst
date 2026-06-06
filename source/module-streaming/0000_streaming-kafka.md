---
id: streaming-kafka
section: modules
title: Streaming & Kafka — real-time data
level: Advanced
minutes: 11
tags: streaming, kafka, real-time
---

Some data can't wait for a nightly batch: fraud alerts, live dashboards, app event tracking, IoT sensors. **Streaming** processes events continuously, within seconds or milliseconds of them happening. **Apache Kafka** is the backbone of most streaming systems.

## Batch vs Streaming (recap, sharpened)

<div class="widget-mount" data-widget="batchStream"></div>

| | Batch | Streaming |
|---|-------|-----------|
| Unit | A chunk on a schedule | Individual events, continuously |
| Latency | Minutes to hours | Milliseconds to seconds |
| Complexity | Lower | Higher |
| Use when | Daily reports, history | Fraud, live metrics, alerts |

Don't reach for streaming unless you truly need low latency — it's harder to build and operate. "Do you actually need real-time?" is a great clarifying question in interviews.

## Kafka in one picture
Kafka is a distributed **log** — an append-only sequence of events that producers write and consumers read, decoupled from each other.
<div class="flow flow-row">
  <div class="flow-node"><strong>Producers</strong><span>apps emitting events</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node tone-gold"><strong>Kafka topic "orders"</strong><span>part0: e1 e2 e3 … · part1: e1 e2 e3 …</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Consumers</strong><span>services reading &amp; reacting</span></div>
</div>

Core vocabulary:
- **Event / message:** one record (e.g. "order #123 placed, ₹500").
- **Topic:** a named stream of events (e.g. `orders`, `clicks`).
- **Partition:** topics are split into partitions for parallelism and scale; order is guaranteed *within* a partition.
- **Producer:** writes events to a topic.
- **Consumer / consumer group:** reads events; a group splits partitions among its members to scale out.
- **Offset:** each event's position in a partition; consumers track how far they've read (so they can resume after a crash).
- **Broker:** one Kafka server; a **cluster** is many brokers for scale + fault tolerance (replication).

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
Kafka is like a group chat that never deletes messages. Anyone (producer) can post; many readers (consumers) read at their own pace and remember where they left off (offset). Posting and reading don't block each other — that decoupling is the whole point.
</div>

## Why Kafka? Decoupling + durability
Without Kafka, every system that needs order data must connect directly to the orders service — a fragile tangle. With Kafka, the orders service just *publishes* events once; any number of consumers (fraud, analytics, email, inventory) subscribe independently. Events are durably stored and replayable.

## Stream processing
Kafka *moves* events; to *transform* them in real time you use a stream processor:
- **Kafka Streams / ksqlDB** — within the Kafka ecosystem.
- **Apache Flink** — powerful, low-latency, the modern favourite for serious streaming.
- **Spark Structured Streaming** — streaming with the familiar Spark DataFrame API (micro-batches).

Hard concepts unique to streaming (name these to sound experienced):
- **Windowing:** aggregating over time windows ("count orders per 1-minute window").
- **Event time vs processing time:** when it *happened* vs when you *processed* it — they differ due to delays.
- **Watermarks:** how long to wait for late-arriving events before closing a window.
- **Delivery guarantees:** *at-most-once*, *at-least-once*, *exactly-once*. Exactly-once is hardest and most desirable (no loss, no duplicates).

## Tiny producer/consumer in Python
```python
from kafka import KafkaProducer, KafkaConsumer
import json

# Producer
producer = KafkaProducer(bootstrap_servers="localhost:9092",
    value_serializer=lambda v: json.dumps(v).encode())
producer.send("orders", {"order_id": 123, "amount": 500})
producer.flush()

# Consumer
consumer = KafkaConsumer("orders", bootstrap_servers="localhost:9092",
    group_id="fraud-checker", auto_offset_reset="earliest")
for msg in consumer:
    order = json.loads(msg.value)
    if order["amount"] > 10000:
        print("⚠️ possible fraud:", order)
```

## Practice
1. Run Kafka via Docker; create a topic; produce and consume messages with the snippet above.
2. Explain consumer groups and offsets to an imaginary interviewer.
3. Describe a real use case where streaming beats batch, and one where batch is the better choice.

> **Key takeaway:** Streaming handles real-time, event-by-event data. **Kafka** is a durable, partitioned, replayable log that *decouples* producers from consumers (topics, partitions, offsets, consumer groups). Use **Flink/Spark Streaming/Kafka Streams** to process it, and mind windowing, event-time, and exactly-once delivery.
