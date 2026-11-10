# SerialPort

A serial port -- an RS-232 device or a USB adapter -- read and written on the
loop the application already runs. On Linux the device is a tty under
`/dev/ttyUSB0` or `/dev/ttyACM0`; the configuration is POSIX `termios`.

```js
const scale = new SerialPort({ PortName: "/dev/ttyUSB0", Speed: 9600,
                               Line: true });
scale.OnLine = (line) => { this.Lbl.Text = line; };
scale.OnError = (e) => { if (e.Kind === "Closed") this.reconnect(); };
scale.Open();
scale.Write("W\n");
```

`OnData` hands the bytes one read returned -- **a serial port is a byte
stream**, so a chunk is not a message. `Line: true` is the only framing the
runtime does; it buffers and raises `OnLine` per `EndOfLine`. `Write` queues
and never blocks.

The class is also a `FormPart`: a `.form` may declare one, with `PortName`,
`Speed`, `DataBits`, `Parity`, `StopBits`, `FlowControl`, `Line` and
`EndOfLine` serialised, and the form's close closes it. `Speed`, `DataBits`,
`Parity`, `StopBits` and `FlowControl` are refused while the port is open;
`Line` and `EndOfLine` may change while it runs.

## Every member

| | |
|---|---|
| `Clear()` | discard what has arrived but not been delivered, and anything queued to write. Answers the port |
| `Close()` | close it; the next `Open` starts again. `Write` on a closed port throws |
| `DataBits` | `5` to `8`, default `8` |
| `EndOfLine` | the line separator `Line` uses, `"\n"` by default: `"\r\n"` for many devices |
| `FlowControl` | `"None"` (the default), `"Hardware"` or `"Software"` |
| `IsOpen` (ro) | whether the port is open now |
| `Line` | `true`: buffer and raise `OnLine` for each complete `EndOfLine`; `false` (the default): `OnData` with the bytes one read returned. **A serial port is a byte stream**, so a chunk is not a frame |
| `OnData` | assign `(bytes) => …`: bytes arrived, **not** a message. `Line: true` uses `OnLine` instead |
| `OnError` | assign `(err) => …` with `{ Message, Kind }`; `Kind` is `"Error"` or `"Closed"`. The port is closed when it arrives |
| `OnLine` | assign `(line) => …`: one complete line, without the separator, in `Line: true` mode |
| `Open()` | open and configure the port. Answers the port; a second `Open` on an open port does nothing |
| `Parity` | `"None"` (the default), `"Even"`, `"Odd"`, `"Mark"` or `"Space"`; the last two need the platform's `CMSPAR` |
| `PortName` | the device path, `/dev/ttyUSB0` or `/dev/ttyACM0` on Linux (and `COM3` on the Windows half when it arrives). Set before `Open` |
| `Speed` | the baud rate, 1 to 4000000. A value the system has no `speed_t` for is refused by `Open`, which names it |
| `StopBits` | `1` (the default) or `2` |
| `Write(data)` | queue text (UTF-8) or `Bytes`; answers the port. It throws when the port is not open, which is a mistake and not a late answer |
| `WriteLine(data)` | `Write` followed by `EndOfLine` |

## What goes wrong

- **`Open` refuses a value the system cannot set.** A baud rate with no
  `speed_t`, mark or space parity where `CMSPAR` is missing, or hardware flow
  control where `CRTSCTS` is missing is a sentence naming the setting, not a
  port opened with the wrong one.
- **The device is not a serial port.** `Open` says so: `tcgetattr` refused it.
- **Nothing arrived.** The read side waits as long as the device takes; there
  is no timeout on it. A guard is the program's `Timer`.
- **A line never ends.** `Line: true` refuses a line longer than 1 MiB rather
  than growing for ever.

## What it does not do

- **No `PinChange`.** POSIX would have to poll `TIOCMGET`; no caller has asked
  for a modem line.
- **No Windows half yet.** The class exists on Windows, its properties answer,
  a `.form` carrying one loads and saves, and `Open` says the half is not
  written. It is `CreateFile`/`SetCommState`/overlapped I/O, a stage of its own.
- **No custom baud rates.** Linux's `termios2`/`TCGETS2` is not reached; the
  standard `B…` constants are the set.
