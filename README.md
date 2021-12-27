## abstract-data-manager

An abstract manager which can be useful for broadcasting lazily-loaded data.

### Usage

Extend the `AbstractDataManager` class and override `async getData()` to customize where data is fetched from.

Consumers call `addListener` to receive updates on the underlying data.

### Features

Allows multiple consumers to get data updates over time.

The manager handles simultaneous requests by locking and preventing multiple calls.

The first listener will trigger an update which makes this a lazily-loaded approach.

### Details

Consumers should call `removeListener` when they no longer need updates.

May optionally override `destruct()` to handle destruction.

May optionally override `clear()` to handle fetch cancelling. (Recommended)

### For Developer

Remember to `npm run build` before deploying.
