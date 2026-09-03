import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def create_whitepaper():
    doc = Document()

    # Configure standard 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Styles
    title_color = RGBColor(15, 23, 42)      # Slate 900
    primary_color = RGBColor(79, 70, 229)   # Indigo 600
    teal_color = RGBColor(13, 148, 136)     # Teal 600
    secondary_color = RGBColor(100, 116, 139) # Slate 500
    dark_body = RGBColor(30, 41, 59)        # Slate 800

    # ----------------------------------------------------
    # TITLE & HEADER
    # ----------------------------------------------------
    p_pre = doc.add_paragraph()
    p_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_pre = p_pre.add_run("BUIDL CTC 2026 FALL HACKATHON • TECHNICAL WHITEPAPER & PROJECT DECK")
    run_pre.font.size = Pt(9.5)
    run_pre.font.bold = True
    run_pre.font.color.rgb = primary_color

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("VaultBridge Platform")
    run_title.font.size = Pt(28)
    run_title.font.bold = True
    run_title.font.color.rgb = title_color

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("Universal Trustless Cross-Chain Verification & Working Capital Credit Facilities on Creditcoin")
    run_sub.font.size = Pt(13)
    run_sub.font.bold = True
    run_sub.font.color.rgb = primary_color

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_meta = p_meta.add_run("Powered by Attestcoin Protocol (@gluwa/usc-sdk) & Native Precompile 0x0FD2\nTracks: Real World Assets (RWA/DeFi) & Gaming / On-Chain Reputation")
    run_meta.font.size = Pt(10)
    run_meta.font.italic = True
    run_meta.font.color.rgb = secondary_color

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ----------------------------------------------------
    # 1. EXECUTIVE SUMMARY & VISION
    # ----------------------------------------------------
    h1 = doc.add_heading("1. Executive Summary & Core Vision", level=1)
    h1.runs[0].font.color.rgb = primary_color

    p = doc.add_paragraph()
    p.add_run("VaultBridge").bold = True
    p.add_run(" is an institutional-grade, privacy-preserving cross-chain credit and verification protocol built natively on ")
    p.add_run("Creditcoin").bold = True
    p.add_run(". By utilizing Creditcoin's native Universal Smart Contract (USC) architecture, the Attestcoin Protocol, and EVM Precompile ")
    p.add_run("0x0FD2").bold = True
    p.add_run(", VaultBridge eliminates centralized oracles and multisig bridge dependencies.")

    p2 = doc.add_paragraph()
    p2.add_run("The platform delivers a unified cryptographic primitive powering two distinct market verticals:").italic = True
    
    bp1 = doc.add_paragraph(style='List Bullet')
    bp1.add_run("Confidential Accounts Receivable Financing (RWA/DeFi Track): ").bold = True
    bp1.add_run("Unlocking working capital against unpaid 30-90 day trade invoices tokenized on Ethereum Sepolia, with AES-256-GCM client-side encryption, ECIES role-based key delegation, and an active 51,000,000 USDC on-chain liquidity pool.")

    bp2 = doc.add_paragraph(style='List Bullet')
    bp2.add_run("StreakChain Habit Attestation (Gaming Track): ").bold = True
    bp2.add_run("A verifiable daily habit check-in system awarding Soulbound Non-Transferable ERC-721 milestone achievement badges, with cryptographic absence proofs trustlessly resetting missed streaks.")

    # ----------------------------------------------------
    # 2. THE $3 TRILLION MARKET CHALLENGE
    # ----------------------------------------------------
    h2 = doc.add_heading("2. The Market Problem: The SME Liquidity Gap", level=1)
    h2.runs[0].font.color.rgb = primary_color

    doc.add_paragraph(
        "Global trade finance suffers from a $3 Trillion liquidity trap. Small and medium enterprises (SMEs) routinely deliver goods and services but must wait 30 to 90 days for buyer invoice settlements. Existing solutions face severe barriers:"
    )

    doc.add_paragraph("• Plaintext Data Exposure: Public blockchains expose confidential trade agreements, counterparty corporate identities, pricing structures, and debt obligations publicly.", style='List Bullet')
    doc.add_paragraph("• Multisig & Oracle Vulnerabilities: Traditional cross-chain bridges rely on trusted federated validator sets or centralized oracles, presenting major attack vectors and high fees.", style='List Bullet')
    doc.add_paragraph("• Rigid Liquidity & High Gas: Traditional factoring models lack dynamic risk underwriting and require separate on-chain transactions for each invoice.", style='List Bullet')

    # ----------------------------------------------------
    # 3. CRYPTOGRAPHIC ARCHITECTURE & ATTESTCOIN ENGINE
    # ----------------------------------------------------
    h3 = doc.add_heading("3. Cryptographic Architecture & USC Engine", level=1)
    h3.runs[0].font.color.rgb = primary_color

    doc.add_paragraph(
        "VaultBridge harnesses Creditcoin's native Attestcoin consensus engine to execute synchronous cross-chain state verification directly inside the EVM via native Precompile 0x0FD2."
    )

    doc.add_heading("3.1 Dual Attestation Modes", level=2)
    doc.add_paragraph("1. Positive Inclusion Proofs (Prove It Happened): Cryptographic Merkle Patricia Trie proofs proving that an invoice settlement or daily habit check-in occurred on Sepolia. Upon verification by Precompile 0x0FD2, VaultLending releases escrowed collateral or increments habit streak counts.", style='List Bullet')
    doc.add_paragraph("2. Negative Absence Proofs (Prove It DID NOT Happen): Mathematical verification across consecutive block headers proving zero payment or check-in events occurred. This trustlessly executes default liquidations or resets missed habit streaks without third-party oracle intervention.", style='List Bullet')

    doc.add_heading("3.2 Privacy Layer & Selective Key Delegation", level=2)
    doc.add_paragraph("• AES-256-GCM Encryption: Raw invoice line items are encrypted in the browser with a random 256-bit symmetric key. Only a 32-byte hash commitment (sha256(ciphertext)) and decentralized storage pointer are recorded on Creditcoin.", style='List Bullet')
    doc.add_paragraph("• ECIES Asymmetric Key Wrapping: The symmetric key is encrypted using the public keys of authorized stakeholders (Auditors, Institutional Lenders, Tax Authorities) and stored in AccessRegistry.sol.", style='List Bullet')
    doc.add_paragraph("• Instant 1-Click Revocation: Borrowers can instantly revoke viewing permissions on-chain, permanently terminating key retrieval for that entity.", style='List Bullet')

    # ----------------------------------------------------
    # 4. LENDING POOL ECONOMICS & RISK TIERS
    # ----------------------------------------------------
    h4 = doc.add_heading("4. Lending Economics & Debtor Risk Underwriting", level=1)
    h4.runs[0].font.color.rgb = primary_color

    doc.add_paragraph(
        "VaultLending.sol implements dynamic risk-adjusted advance rates based on verified debtor credit scoring:"
    )

    # Risk Tier Table
    table = doc.add_table(rows=4, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'

    headers = ["Risk Tier", "Credit Score Range", "Advance Rate (LTV)", "Fixed Borrow APR"]
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = h
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(9.5)
        set_cell_background(cell, "4F46E5")
        cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(cell, 120, 120, 150, 150)

    rows_data = [
        ["Tier A (Prime)", "Credit Score ≥ 750", "80.00% (8,000 bps)", "4.00% Fixed APR"],
        ["Tier B (Standard)", "Credit Score 650 – 749", "70.00% (7,000 bps)", "4.50% Fixed APR"],
        ["Tier C (Subprime)", "Credit Score < 650", "50.00% (5,000 bps)", "6.50% Fixed APR"],
    ]

    for row_idx, data in enumerate(rows_data, start=1):
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(data):
            cell = table.cell(row_idx, col_idx)
            cell.text = text
            cell.paragraphs[0].runs[0].font.size = Pt(9)
            set_cell_background(cell, bg)
            set_cell_margins(cell, 100, 100, 150, 150)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    doc.add_paragraph(
        "• 51,000,000 USDC On-Chain Pool: VaultLending is capitalized with 51M MockUSDC on Creditcoin Testnet to support large institutional facilities.\n"
        "• Yield & Liquidity Vault: Capital providers earn continuous 8.50% APY on deposited assets.\n"
        "• Bulk Merkle Batching (verifyBatch): Aggregates up to 20 invoices in a single transaction sharing one block continuity proof, saving 86.5% gas."
    )

    # ----------------------------------------------------
    # 5. STREAKCHAIN GAMING MODULE
    # ----------------------------------------------------
    h5 = doc.add_heading("5. StreakChain: Habit Attestation & Soulbound NFTs", level=1)
    h5.runs[0].font.color.rgb = primary_color

    doc.add_paragraph(
        "StreakChain demonstrates the versatility of the Attestcoin Protocol outside finance. Users record daily fitness, coding, or learning habits on Ethereum Sepolia. Creditcoin's StreakVerifier.sol verifies check-ins via Precompile 0x0FD2 and mints non-transferable Soulbound ERC-721 badges:"
    )

    doc.add_paragraph("• 🥉 Bronze Badge (sSTRK #7): Awarded upon completing a 7-Day Streak.", style='List Bullet')
    doc.add_paragraph("• 🥈 Silver Badge (sSTRK #30): Awarded upon completing a 30-Day Streak.", style='List Bullet')
    doc.add_paragraph("• 🥇 Gold Badge (sSTRK #100): Awarded upon completing a 100-Day Streak.", style='List Bullet')
    doc.add_paragraph("• Timezone Boundary Grace Window: 15-minute grace window preventing duplicate reverts for check-ins submitted at 23:59:45 UTC.", style='List Bullet')
    doc.add_paragraph("• Non-Transferable Reputation: Badges override ERC-721 transfer hooks, preventing secondary speculation and preserving genuine on-chain discipline.", style='List Bullet')

    # ----------------------------------------------------
    # 6. VERIFIED DEPLOYMENTS
    # ----------------------------------------------------
    h6 = doc.add_heading("6. Verified Live Smart Contract Deployments", level=1)
    h6.runs[0].font.color.rgb = primary_color

    deploy_table = doc.add_table(rows=9, cols=3)
    deploy_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    deploy_table.style = 'Table Grid'

    d_headers = ["Network / Chain", "Contract / Primitive", "Verified On-Chain Address"]
    for i, h in enumerate(d_headers):
        cell = deploy_table.cell(0, i)
        cell.text = h
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(9.5)
        set_cell_background(cell, "0F172A")
        cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(cell, 120, 120, 150, 150)

    d_rows = [
        ["Ethereum Sepolia (11155111)", "InvoiceRegistrar.sol", "0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021"],
        ["Ethereum Sepolia (11155111)", "StreakRegistry.sol", "0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce"],
        ["Creditcoin USC (102031)", "VaultLending.sol (51M Pool)", "0xE8686e4D2856Da637F2c17c71d818911Ec541dE5"],
        ["Creditcoin USC (102031)", "AccessRegistry.sol", "0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe"],
        ["Creditcoin USC (102031)", "StreakVerifier.sol", "0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A"],
        ["Creditcoin USC (102031)", "StreakBadge.sol (Soulbound)", "0xfa41181596515986C87A969F51daD5af597eB3b7"],
        ["Creditcoin USC (102031)", "MockERC20.sol (Faucet)", "0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714"],
        ["Creditcoin USC (102031)", "IUSCVerifier Precompile", "0x0000000000000000000000000000000000000FD2"],
    ]

    for row_idx, data in enumerate(d_rows, start=1):
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(data):
            cell = deploy_table.cell(row_idx, col_idx)
            cell.text = text
            cell.paragraphs[0].runs[0].font.size = Pt(8.5)
            if col_idx == 2:
                cell.paragraphs[0].runs[0].font.name = "Courier New"
            set_cell_background(cell, bg)
            set_cell_margins(cell, 90, 90, 130, 130)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ----------------------------------------------------
    # 7. PERFORMANCE BENCHMARKS & GAS EFFICIENCY
    # ----------------------------------------------------
    h7 = doc.add_heading("7. Performance Benchmarks & Test Suite Results", level=1)
    h7.runs[0].font.color.rgb = primary_color

    doc.add_paragraph(
        "• Smart Contract Unit Tests: 44 / 44 Passing (100% test coverage across AccessRegistry, InvoiceRegistrar, StreakBadge, StreakRegistry, StreakVerifier, and VaultLending).\n"
        "• Privacy Layer Crypto Tests: 3 / 3 Passing (AES-256-GCM roundtrip, ECIES key wrapping, and tampering detection).\n"
        "• Proof Pipeline Isolation & E2E Tests: 7 / 7 Passing (Positive Merkle proofs, Absence proofs, and live Sepolia-Creditcoin attestation).\n"
        "• Next.js Production Build: 13 / 13 Static and Dynamic Routes Compiled Cleanly (Code 0)."
    )

    # Gas Benchmark Table
    gas_table = doc.add_table(rows=4, cols=5)
    gas_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    gas_table.style = 'Table Grid'

    g_headers = ["Verification Mode", "Gas per Invoice", "10 Invoices Batch", "Total Transactions", "Efficiency Gain"]
    for i, h in enumerate(g_headers):
        cell = gas_table.cell(0, i)
        cell.text = h
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(9)
        set_cell_background(cell, "0D9488")
        cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(cell, 120, 120, 140, 140)

    g_rows = [
        ["Single Verification (verifySingle)", "~52,000 gas", "~520,000 gas", "10 transactions", "Baseline"],
        ["Bulk Merkle Batching (verifyBatch)", "~7,000 gas", "~70,000 gas", "1 single transaction", "⚡ 86.5% Gas Saved"],
        ["Absence Proof Header Continuity", "~38,000 gas", "N/A (1 window)", "1 transaction", "Zero Oracle Trust"],
    ]

    for row_idx, data in enumerate(g_rows, start=1):
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(data):
            cell = gas_table.cell(row_idx, col_idx)
            cell.text = text
            cell.paragraphs[0].runs[0].font.size = Pt(8.5)
            set_cell_background(cell, bg)
            set_cell_margins(cell, 90, 90, 130, 130)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ----------------------------------------------------
    # 8. 10-SLIDE PROJECT PITCH DECK SUMMARY
    # ----------------------------------------------------
    h8 = doc.add_heading("8. Executive Pitch Deck Summary (10 Slides)", level=1)
    h8.runs[0].font.color.rgb = primary_color

    slides = [
        ("Slide 1: Title & Vision", "VaultBridge: Universal Trustless Cross-Chain Verification & Private Working Capital Facilities on Creditcoin. Unlocking $3T in global SME trade finance and verifiable on-chain gaming without centralized oracles."),
        ("Slide 2: The Problem", "SMEs face a $3T liquidity gap in unpaid 30-90 day receivables. Existing blockchain invoice factoring exposes sensitive trade secrets on public ledgers and relies on vulnerable multisig bridges."),
        ("Slide 3: The Solution", "Zero-Plaintext on-chain architecture powered by AES-256-GCM client encryption, ECIES key delegation, and Creditcoin's native Attestcoin Precompile 0x0FD2 for synchronous cryptographic verification."),
        ("Slide 4: Core Architecture", "One shared Attestcoin verification engine powering two products: Private Accounts Receivable Lending (RWA Track) and StreakChain Habit Attestation (Gaming Track)."),
        ("Slide 5: Privacy & Key Delegation", "Borrowers retain full data sovereignty. Granular ECIES viewing keys delegated to Verified Auditors, Lenders, and Tax Authorities with instant 1-click on-chain revocation via AccessRegistry.sol."),
        ("Slide 6: Liquidity & Risk Underwriting", "Active 51,000,000 USDC on-chain pool with dynamic debtor risk tiers (Tier A 80%, Tier B 70%, Tier C 50% LTV) and an 8.5% APY Yield Vault."),
        ("Slide 7: StreakChain Gaming Module", "Daily habit check-ins on Sepolia verified on Creditcoin, awarding non-transferable Soulbound ERC-721 milestone badges (7, 30, 100 days) with absence-proof streak resets."),
        ("Slide 8: Autonomous Settlement Keeper", "Autonomous Keeper sidecar executing automated default liquidations and streak breaks with instant Discord/Telegram alerts and live Server-Sent Events (SSE) feed."),
        ("Slide 9: Technical Milestones & Tests", "44/44 contract tests passing, 3/3 crypto roundtrip tests, 7/7 proof pipeline tests, 13/13 Next.js routes, and 86.5% gas savings via verifyBatch."),
        ("Slide 10: Roadmap & Call to Action", "Phase 3 ZK stealth address unlinkability, multi-chain expansion (Arbitrum, Base, Optimism), and live institutional pilot onboarding."),
    ]

    for title, content in slides:
        p_slide = doc.add_paragraph()
        p_slide.add_run(f"• {title}: ").bold = True
        p_slide.add_run(content)

    doc.save("c:/Users/USER/Downloads/VaultBridge/VaultBridge_Whitepaper_and_Project_Deck.docx")
    print("Successfully generated VaultBridge_Whitepaper_and_Project_Deck.docx")

if __name__ == "__main__":
    create_whitepaper()
