<div align="center">

<img src="frontend/public/favicon.svg" width="80" height="80" alt="EduChain Logo" />

# EduChain

### Decentralized Academic Credential Verification

**Issue · Verify · Trust — Powered by Ethereum**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)](https://soliditylang.org)
[![Ethereum](https://img.shields.io/badge/Network-Sepolia%20Testnet-purple?logo=ethereum)](https://sepolia.etherscan.io)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%2020-339933?logo=node.js)](https://nodejs.org)

[Live Demo](https://educhain.yourdomain.com) · [Smart Contract](https://sepolia.etherscan.io/address/0xYourContract) · [Research Paper](#research-paper)

---

> **EduChain** eliminates fake academic degrees by letting accredited institutions issue tamper-proof,
> blockchain-verified credentials directly on Ethereum. Anyone — employer, visa officer, university —
> can verify a credential in seconds using just a hash or QR code. No login. No middleman. No forgery.

</div>

---

## Table of Contents

- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start (macOS)](#quick-start-macos)
- [Deployment](#deployment)
- [Smart Contract](#smart-contract)
- [API Reference](#api-reference)
- [Research Paper](#research-paper)
- [Roadmap](#roadmap)
- [License](#license)

---

## The Problem

Fake academic credentials are a global crisis:

- **🌍 Global scale** — The diploma mill industry generates over **$1 billion/year** in fraudulent degrees
- **🇮🇳 India** — Over **50% of resumes** contain falsified educational qualifications (KPMG, 2023)
- **🇨🇳 China** — Thousands of fake degree cases prosecuted annually; cross-border verification takes **weeks to months**
- **⚠️ Consequences** — Unqualified professionals in medicine, engineering, and law cause real harm to society
- **🐢 Current process** — Manual verification via email and paper is slow, expensive, and easily bypassed

**The root cause:** Academic credentials live in centralized, siloed institutional databases — vulnerable to forgery, data loss, and inaccessibility.

---

## Our Solution

EduChain moves academic credentials **on-chain** — making them:

| Property | Traditional System | EduChain |
|---|---|---|
| **Forgery resistance** | Low — paper/PDF easily faked | Cryptographically impossible |
| **Verification speed** | Days to weeks | Seconds |
| **Availability** | Business hours, institution dependent | 24/7, globally accessible |
| **Ownership** | Institution controls student data | Student owns their credentials |
| **Cost** | $50–200 per verification | Near-zero (gas fee only) |
| **Trust model** | Trust the institution's email | Trust Ethereum's math |

---

## Architecture

┌─────────────────────────────────────────────────────────────┐
│                        User Interfaces                       │
│   Student Dashboard · Verify Page · Issue Page · Explorer   │
└────────────────────────────┬────────────────────────────────┘
│  React + Ethers.js
┌────────────────────────────▼────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│         MetaMask Wallet · QR Scanner · IPFS Upload          │
└──────────────┬──────────────────────────┬───────────────────┘
│ Direct RPC calls         │ REST API calls
┌──────────────▼──────────┐  ┌────────────▼───────────────────┐
│   Ethereum Blockchain   │  │     Backend (Node.js + Express) │
│                         │  │                                 │
│  ┌───────────────────┐  │  │  ┌──────────────────────────┐  │
│  │  EduChain.sol     │  │  │  │  Event Sync Service      │  │
│  │                   │  │  │  │  (listens to chain events│  │
│  │  - issueCredential│◄─┼──┼──┤   caches in MongoDB)     │  │
│  │  - verifyCredential│ │  │  └──────────────────────────┘  │
│  │  - revokeCredential│ │  │                                 │
│  │  - AccessControl  │  │  │  ┌──────────────────────────┐  │
│  └───────────────────┘  │  │  │  MongoDB                 │  │
│                         │  │  │  (off-chain cache for    │  │
└─────────────────────────┘  │  │   fast API queries)      │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  IPFS via Pinata         │  │
│  │  (degree PDF storage)    │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
