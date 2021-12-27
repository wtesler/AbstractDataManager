/**
 * An abstract manager which can be useful for broadcasting lazily-loaded data.
 *
 * Extend this class and override `async getData()` to customize data source.
 *
 * May optionally override `destruct()` to handle destruction.
 * May optionally override `clear()` to handle fetch cancelling.
 *
 * The manager handles locking to prevent simultaneous fetches of the data.
 *
 * The first listener can trigger an update.
 *
 * Subsequent updates can be triggered manually.
 *
 * Managers which extend this class should implement a function with the signature `async getData()`
 * which returns data and can involve a network request for example.
 */
export default class AbstractDataManager {
  data = null;
  listeners = [];
  locked = false; // Prevents simultaneous data fetches.

  /**
   * Abstract function must be implemented. It's return value is the data.
   */
  async getData() {
    this._throwNotImplemented();
  }

  /**
   * Virtual function which may optionally be implemented.
   * If implementing, should call `super.destruct()`.
   */
  destruct() {
    this.cancel();
  }

  /**
   * Abstract function which may optionally be implemented.
   *
   * Needed if calling `update` with parameter `cancelCurrentIfLocked`.
   */
  cancel() {
    if (this.locked) {
      console.warn(`Cancel was called but inherited class has not implemented cancel()`);
    }
  }

  /**
   * Attempt to update the data with the defined `getData` function.
   * Notifies all listeners of the update after finished.
   *
   * If an update is already in progress (and you aren't canceling it) then this call will no-op.
   *
   * @param onError Emits with the error if anything went wrong.
   * @param cancelCurrentIfLocked Instead of not updating, we try to cancel the current update and then start our own.
   */
  async update(onError=null, cancelCurrentIfLocked=false) {
    if (this.locked) {
      if (cancelCurrentIfLocked) {
        this.cancel();
      } else {
        return;
      }
    }

    try {
      this.locked = true;
      this.data = await this.getData();
      for (const listener of this.listeners) {
        listener(this.data);
      }
    } catch(e) {
      if (onError) {
        onError(e);
      } else {
        throw e;
      }
    } finally {
      this.locked = false;
    }
  }

  /**
   * Add a listener to changes in the underlying data.
   * Calls listener immediately if data already exists.
   * Otherwise, if no current update is occurring, triggers an update.
   * After the update is finished, the listener will receive the call back.
   *
   * @param listener The listener
   * @param onError Error which can occur if an initial update is attempted and fails.
   * @param updateIfEmpty true if the manager should try to update the data if there isn't any.
   */
  addListener(listener, onError=null, updateIfEmpty=true) {
    this.listeners.push(listener);
    if (this.data) {
      listener(this.data);
    } else if (updateIfEmpty) {
      // noinspection JSIgnoredPromiseFromCall
      this.update(onError); // Purposefully don't await this.
    }
  }

  /**
   * Stop listening to changes in the underlying data.
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(x => x !== listener);
  }

  /**
   * Unsets the underlying data.
   */
  clear() {
    this.data = undefined;
  }

  _throwNotImplemented() {
    throw new Error("Inherited class must implement this method.");
  }
}
