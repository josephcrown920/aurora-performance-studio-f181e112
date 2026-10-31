# Original PureMix source

Source: https://github.com/josephcrown920/PureMix-AI
Pinned commit: 791acde1cec4d19e1ad72495bab94986b190912e

`audioMastering.py` is copied unchanged from the original three-stage v4 engine. `audioAnalysis.py`, `upload.tsx`, `job.tsx` and `SimulatedDemo.tsx` preserve the source screens and analysis for a faithful integration, not a replacement LANDR or invented browser DSP engine. Original rights remain with the source project.

Local command: `python audioMastering.py INPUT.wav OUTPUT.wav streaming -14`.

December was processed end-to-end locally with the original streaming preset, 44.1 kHz stereo 24-bit output. No inference credits or paid APIs were used. The engine trims boundary silence and may not achieve both loudness and peak targets for every source. Its limiter implementation scales sample peaks, despite upstream comments describing true-peak limiting; do not overstate that guarantee.

Hosted arbitrary-file mastering is not integrated. This engine needs a separately deployed Python worker and Aurora-authenticated job/storage handling; web hosting cannot run Python subprocesses. The source UI's existing auth/payment/job contracts must be adapted before mounting it as a working tool.