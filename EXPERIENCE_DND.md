<div align="center">

# 🛡️ Department of National Defence (DND)

### Network Management System Specialist / Software Engineer | Ottawa, ON

**September 2026 – Present**

[![Kratos Compass](https://img.shields.io/badge/Kratos_Compass-M%26C_Backbone-1B3A4B?style=for-the-badge&logoColor=white)](https://www.kratosdefense.com/)
[![C](https://img.shields.io/badge/C-00599C?style=for-the-badge&logo=c&logoColor=white)](https://en.wikipedia.org/wiki/C_(programming_language))
[![Lua](https://img.shields.io/badge/Lua-2C2D72?style=for-the-badge&logo=lua&logoColor=white)](https://www.lua.org/)
[![VMware](https://img.shields.io/badge/VMware_ESXi-607078?style=for-the-badge&logo=vmware&logoColor=white)](https://www.vmware.com/)
[![SNMP](https://img.shields.io/badge/SNMP_%C2%B7_Modbus_%C2%B7_TCP_%C2%B7_UDP_%C2%B7_HTTP-0F766E?style=for-the-badge)](https://en.wikipedia.org/wiki/Simple_Network_Management_Protocol)

</div>

---

## 🎯 The Mission

> *"One console for the ground segment — so the people on shift can see the network, trust the alarms, and spend their attention on the pass, not the plumbing."*

At the **Department of National Defence** I work as a **Network Management System Specialist and Software Engineer** on the monitor-and-control (M&C) system that sits underneath satellite communications operations. The job is to make a scattered fleet of equipment behave like one system: power, baseband, RF, and the ground station around them, all reporting into the same place and taking direction from it.

**[Kratos Compass](https://www.kratosdefense.com/)** is the backbone. Compass is the operational picture SATCOM crews live in — status, alarms, control, and the procedures that tie those together. My work is the layer between that picture and the hardware: new features on the M&C system, the drivers and scripts that teach Compass how to talk to a device, and the automation that turns a checklist in someone's head into something the platform can run the same way on every shift.

This is software with a room attached to it. A feature is not done when it compiles. It is done when an operator can bring a link up, see that the power rail is healthy, notice a fault before it becomes an outage, and recover without logging into six vendor web pages.

---

## 🛰️ What Monitor & Control Actually Means

A ground station is a chain. Power feeds the rack. The rack hosts modems, converters, switches, and the rest of the SATCOM chain. The antenna and the outdoor equipment sit at the far end of that chain. Each box has its own interface, its own idea of "healthy," and its own way of failing quietly.

M&C exists so nobody has to swivel-chair that chain during a live contact.

- **See it.** Poll status, collect telemetry, and raise an alarm when a value leaves the range that matters — not every flicker the device feels like emitting.
- **Steer it.** Send a control action from the same console that showed the fault: a switchover, a power cycle, a configuration the procedure already calls for.
- **Remember it.** Keep enough history and enough of the procedure in software that the next shift inherits a system, not a folklore.

Compass is where that comes together. The devices stay different. The way the crew operates them does not.

---

## 🔌 Connecting the Ground Segment

The interesting part of this work is the variety of things that have to share one management plane. A power bar and a SATCOM modem do not speak the same language, and neither of them cares that an operator would like a single pane of glass. Integration is the job of making them care anyway.

| Path | Where it shows up | What I use it for |
|------|-------------------|-------------------|
| **SNMP** | Network gear and managed SATCOM equipment | Polling, traps, and alarm normalization into Compass |
| **Modbus** | Power distribution and other industrial controllers | Reading rails and driving outlets from the same console as the RF chain |
| **TCP** | Session-oriented device protocols | Reliable command and telemetry sessions with equipment that expects a connection |
| **UDP** | Lightweight telemetry and discovery | Status that has to move quickly and tolerate a lossy path |
| **HTTP** | Device web APIs and management interfaces | Reaching equipment whose native interface is a service, not a serial protocol |

On the other side of those protocols: **power distribution units**, **SATCOM equipment**, and **ground-station systems**. Each new device is a small product of its own — learn the manual, map the points that operators actually act on, decide what is an alarm versus noise, and land it in Compass so the crew never has to know which protocol carried the byte.

---

## 🧰 Technology Stack

| Category | Technologies |
|----------|-------------|
| **M&C Platform** | Kratos Compass |
| **Languages** | C, Lua, BeanShell, Bash |
| **Protocols** | SNMP, Modbus, TCP, UDP, HTTP |
| **Infrastructure** | VMware ESXi, iDRAC, management networking |
| **Domain** | SATCOM, ground stations, monitor & control |

### What each language is doing here

- **C** is for device drivers. This is the close-to-the-metal work: talk to the equipment correctly, handle timeouts and partial reads, and hand Compass a stable status and control surface instead of a raw protocol trace.
- **Lua** is for driver and device logic that should stay close to the equipment and easy to revise when a firmware rev changes a register or a response.
- **BeanShell** is for the Java-side scripting inside the M&C platform — glue, feature logic, and automation that belongs in the Compass runtime rather than in a one-off shell on a server.
- **Bash** is for the operating system around the platform: host setup, repeatable maintenance, log and health collection, and the scripts that keep a deployment from depending on someone remembering the right flags at 2 a.m.

---

## 🖥️ The Platform Under the Platform

The M&C system only helps operators if the system itself stays up, and if someone can still reach it when it does not.

- **VMware ESXi** hosts the management system. Virtualizing Compass and its supporting services keeps the operational software movable, recoverable, and separate from the quirks of a single bare-metal box.
- **iDRAC** is the out-of-band path to the servers. When a guest operating system is wedged, or a host needs a look before the management network is happy, the lights-out controller is how you still have a console.
- **Networking** is the difference between a lab integration and a ground station. Management traffic, device traffic, and the paths operators depend on are treated as designed networks: named, documented, segmented, and changed on purpose.

Best practice here is not a poster on the wall. It is how a change is allowed to reach equipment that other people are using to do their job. That means a known configuration, a driver that fails visibly, an alarm that means something, access limited to the people who need it, and a procedure an operator can run without a developer sitting beside them.

---

## ⚙️ Automation for the People on Console

SATCOM operations are full of work that is important, repetitive, and easy to do slightly differently every time: health checks before a contact, bringing equipment to a known state, walking a fault through the same first questions, collecting the evidence someone will ask for after the fact.

I automate those workflows so the platform carries them.

A good operator script is boring on purpose. It checks the same points, in the same order, and stops with a clear reason when the chain is not ready. It does not invent a heroic recovery the crew did not ask for. The win is a shift that spends its judgment on the contact — weather, the link, the anomaly that is actually new — because the routine path already lives in Compass and in the host scripts around it.

---

## 💡 Key Contributions

- **Shipped new monitor-and-control features on Kratos Compass** — the operational backbone for SATCOM equipment and ground stations, used by the people on console.
- **Wrote C device drivers, with Lua and BeanShell alongside them,** so power distribution, SATCOM gear, and ground-station hardware report status and take control from one system.
- **Integrated devices over SNMP, Modbus, TCP, UDP, and HTTP,** and normalized alarms, telemetry, and commands into a single operator view.
- **Automated SATCOM operator workflows in Bash and in-platform scripts** so health checks, setup, and recovery follow the same procedure on every shift.
- **Ran the management system on VMware ESXi and used iDRAC for out-of-band access,** keeping a path to the hosts when the guest operating system is not the way in.
- **Applied operational best practices across the management network** — segmentation, controlled access, consistent naming, and change discipline fit for a defence environment.
- **Turned console procedures into software** so SATCOM operators supervise the network instead of hand-driving every device.

---

## 🧭 What This Adds

Border systems taught me how to ship software the government actually runs. Clinical mobile work taught me how to respect a user who does not have time for a clumsy screen. This role puts both habits on a live ground segment.

The user is an operator with a contact window. The interface is an alarm list and a control action. The integration is only real once a power bar, a modem, and a ground-station device all tell the truth in the same place. I get to build that — drivers in C, logic in Lua and BeanShell, host automation in Bash — on the platform the crew already trusts.

---

<div align="center">

[← Back to Profile](README.md)

*"The best operator tool is the one that makes the right action the boring one."* 📡

</div>
