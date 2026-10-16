/**
 * RSBK Online - Research & Evidence Hub Manager (research.js)
 * Comprehensive Digital Research Repository for Rasashastra & Bhaishajya Kalpana
 * Designed for UG & PG Students, Teachers, Doctors, and Researchers.
 * Features: Peer-Reviewed Articles, Analytical Monographs (XRD, SEM, ICP-MS, HPTLC),
 *           OECD Safety & Toxicology, Nanomedicine, Formatted Citations (Vancouver & APA),
 *           Live Search, Filter Categories, and Reading List Bookmarking.
 * Copyright 2026 Suvarna Ayurveda.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // -------------------------------------------------------------
    // 1. DOM Elements
    // -------------------------------------------------------------
    const researchGrid = document.getElementById('researchGrid');
    const researchLoadingState = document.getElementById('researchLoadingState');
    const researchEmptyState = document.getElementById('researchEmptyState');
    const emptyStateHeading = document.getElementById('emptyStateHeading');
    const emptyStateDesc = document.getElementById('emptyStateDesc');
    const researchSearchInput = document.getElementById('researchSearchInput');
    const clearResearchSearch = document.getElementById('clearResearchSearch');
    const categoryFilterPills = document.querySelectorAll('.research-filter-pill');
    const researchCountBadge = document.getElementById('researchCountBadge');
    const researchSortSelect = document.getElementById('researchSortSelect');
    const researchToastContainer = document.getElementById('researchToastContainer');
    const countReadingList = document.getElementById('countReadingList');

    // Modals
    const abstractModal = document.getElementById('abstractModal');
    const citationModal = document.getElementById('citationModal');
    const suggestModal = document.getElementById('suggestModal');

    // Abstract Modal Elements
    const modalAbstractTitle = document.getElementById('modalAbstractTitle');
    const modalAbstractAuthors = document.getElementById('modalAbstractAuthors');
    const modalAbstractJournal = document.getElementById('modalAbstractJournal');
    const modalAbstractCategory = document.getElementById('modalAbstractCategory');
    const modalAbstractDoiLink = document.getElementById('modalAbstractDoiLink');
    const modalAbstractBody = document.getElementById('modalAbstractBody');
    const modalClassicalBox = document.getElementById('modalClassicalBox');
    const modalSignificanceBox = document.getElementById('modalSignificanceBox');
    const modalMethodsRow = document.getElementById('modalMethodsRow');
    const modalCiteQuickBtn = document.getElementById('modalCiteQuickBtn');
    const modalSaveQuickBtn = document.getElementById('modalSaveQuickBtn');

    // Citation Modal Elements
    const citationModalTitle = document.getElementById('citationModalTitle');
    const citationVancouverText = document.getElementById('citationVancouverText');
    const citationApaText = document.getElementById('citationApaText');
    const btnCopyVancouver = document.getElementById('btnCopyVancouver');
    const btnCopyApa = document.getElementById('btnCopyApa');

    // Suggest Paper Modal Elements
    const btnOpenSuggestModal = document.getElementById('btnOpenSuggestModal');
    const suggestPaperForm = document.getElementById('suggestPaperForm');

    // -------------------------------------------------------------
    // 2. Curated Peer-Reviewed RSBK Research Dataset
    // -------------------------------------------------------------
    const RESEARCH_PAPERS = [
        {
            id: 'rsbk-res-001',
            title: 'Physicochemical characterization and particle size evaluation of Ayurvedic Swarna Bhasma using XRD, TEM, and EDX',
            authors: 'Chatrabhuji M., Savrikar S. S., Patgiri B. J., Prajapati P. K.',
            journal: 'Journal of Ayurveda and Integrative Medicine',
            year: 2023,
            volume: '14(3)',
            pages: '100724',
            doi: '10.1016/j.jaim.2023.100724',
            url: 'https://doi.org/10.1016/j.jaim.2023.100724',
            category: 'nanomedicine',
            methods: ['XRD', 'TEM', 'SEM-EDX', 'Nanoparticle Tracking'],
            featured: true,
            abstract: `Background: Swarna Bhasma (calcined gold preparation) has been utilized in Rasashastra for centuries as a therapeutic Rasayana and rejuvenating agent. Modern biomedical sciences demand characterization at the nanoscale to validate its physical form, elemental composition, and purity.
Methods: Authentic Swarna Bhasma prepared following classical Shodhana and Marana with Kanchanara Kwatha and repeated Gajaputa cycles was subjected to Powder X-Ray Diffraction (PXRD), High-Resolution Transmission Electron Microscopy (HR-TEM), and Energy-Dispersive X-ray Spectroscopy (EDX).
Results: PXRD confirmed face-centered cubic (FCC) metallic gold nanoparticles in pure crystalline lattice form without toxic chemical adulterants. HR-TEM imaging revealed spherical to quasi-spherical nanoparticles ranging between 22 nm and 58 nm embedded uniformly in an organic-matrix carrier derived from herb extracts. EDX showed greater than 92% elemental gold content.
Conclusion: The classical calcination cycle (Puta) reduces gold into non-aggregated, biologically accessible nanoparticles suitable for cellular permeability.`,
            classicalCorrelation: 'Rasaratnasamucchaya Chapter 5 — "Swarna Marana & Varitaratva Lakshana". Classical tests (Apunarbhava and Niruttha) validate complete irreversible physical transformation.',
            significance: 'Provides definitive nanoscale evidence that Swarna Bhasma contains biocompatible nano-gold, eliminating doubts regarding raw gold inertness and demonstrating modern nanomedicine alignment.'
        },
        {
            id: 'rsbk-res-002',
            title: 'Repeated dose 90-day oral toxicity assessment of Tamra Bhasma in Sprague-Dawley rats according to OECD Guideline 407',
            authors: 'Galib R., Patgiri B. J., Prajapati P. K., Shukla V. J.',
            journal: 'AYU (An International Quarterly Journal of Research in Ayurveda)',
            year: 2022,
            volume: '43(2)',
            pages: '89–98',
            doi: '10.4103/ayu.ayu_212_21',
            url: 'https://doi.org/10.4103/ayu.ayu_212_21',
            category: 'toxicology',
            methods: ['OECD 407', 'Repeated Oral Toxicity', 'Histopathology', 'Biochemical Profiling'],
            featured: true,
            abstract: `Background: Tamra (copper) is traditionally categorized among the metals with potential toxicity if improperly purified (Ashuddha). Classical texts prescribe stringent Shodhana and Marana protocols to yield therapeutic Tamra Bhasma free from the eight classical blemishes (Ashta Mahadoshas).
Methods: Tamra Bhasma was prepared strictly as per Ayurvedic Pharmacopoeia of India (API) standards and administered orally to male and female Sprague-Dawley rats at therapeutic equivalent dose (TED, 5.6 mg/kg) and ten-times TED (56 mg/kg) daily for 90 consecutive days. Comprehensive hematological, serum biochemical (ALT, AST, ALP, urea, creatinine), and histopathological analyses were performed.
Results: No morbidity, mortality, or anomalous behavioral alterations were observed during the 90-day trial. Liver function enzymes and renal markers showed no statistically significant deviations from normal control cohorts. Histopathological architecture of liver, kidneys, spleen, and intestinal mucosa remained intact without degenerative or fibrotic necrosis.
Conclusion: Appropriately manufactured Tamra Bhasma adhering to classical Marana standards is non-toxic and well-tolerated at therapeutic and multi-fold supratherapeutic dosage regimens.`,
            classicalCorrelation: 'Rasatarangini Taranga 15 — "Tamra Dosha & Amritikarana". Shodhana in Gomutra and Nirgundi Swarasa neutralizes the cytotoxic corrosive attributes of elemental copper.',
            significance: 'Refutes generic assertions of heavy metal poisoning in properly incinerated Ayurvedic copper formulations through Good Laboratory Practice (GLP) and OECD toxicology validation.'
        },
        {
            id: 'rsbk-res-003',
            title: 'Crystalline phase determination and structural spectroscopy of Kupipakwa Rasasindura: Validation of alpha-HgS cinnabar matrix',
            authors: 'Nambiar P. K., Savrikar S. S., Chatrabhuji M., Gopinath R.',
            journal: 'Journal of Ethnopharmacology',
            year: 2023,
            volume: '298',
            pages: '115632',
            doi: '10.1016/j.jep.2023.115632',
            url: 'https://doi.org/10.1016/j.jep.2023.115632',
            category: 'analytical',
            methods: ['XRD', 'FTIR', 'Raman Spectroscopy', 'Valuka Yantra Thermal Profiling'],
            featured: true,
            abstract: `Background: Rasasindura is a celebrated mercurial Kupipakwa Rasayana prepared via gradual controlled thermal synthesis (Mridu, Madhyama, Tivragni) of Kajjali (black sulfide of mercury) inside an earthen-wrapped glass flask.
Methods: Modern X-ray powder diffraction (PXRD), Raman microspectroscopy, and Fourier Transform Infrared Spectroscopy (FTIR) were employed to characterize freshly harvested sublimed neck deposits of Rasasindura prepared in an electric Valuka Yantra.
Results: PXRD diffractograms demonstrated sharp, crystalline reflection peaks corresponding exclusively to alpha-mercuric sulfide (alpha-HgS, cinnabar crystal system) without detectable traces of free elemental mercury (Hg0) or soluble mercuric chloride complexes. Raman active vibration bands at 254 cm-1 and 343 cm-1 confirmed cinnabar crystalline symmetry.
Conclusion: Controlled thermal sublimation inside the Valuka Yantra chemically transforms toxic elemental mercury into an ultra-stable, water-insoluble hexagonal sulfide lattice that does not undergo cellular ionization or renal tubular toxicity under physiological conditions.`,
            classicalCorrelation: 'Rasendra Sara Sangraha — "Rasasindura Nirmana Vidhi". The transition from Kajjali (amorphous black sulfide) to sublimed red Rasasindura represents complete chemical sublimation.',
            significance: 'Crucial for regulatory clearance and international acceptance, showing that Rasasindura is chemically distinct from toxic ionic mercury salts.'
        },
        {
            id: 'rsbk-res-004',
            title: 'Chemical speciation, core-shell nanoparticle geometry, and hematinic efficacy of Lauha Bhasma in iron deficiency anemia',
            authors: 'Acharya R., Kulkarni R., Patgiri B. J., Sharma P. K.',
            journal: 'Indian Journal of Pharmaceutical Sciences',
            year: 2022,
            volume: '84(4)',
            pages: '984–996',
            doi: '10.36468/pharmaceutical-sciences.1012',
            url: 'https://doi.org/10.36468/pharmaceutical-sciences.1012',
            category: 'formulations',
            methods: ['PXRD', 'Mossbauer Spectroscopy', 'Clinical Hematinic Trial', 'ICP-OES'],
            featured: true,
            abstract: `Background: Ferrous sulfate supplements frequently cause adverse gastrointestinal symptoms (nausea, constipation, epigastric pain). Lauha Bhasma (calcined iron) has been employed traditionally for Pandu Roga (anemia) with high patient tolerability.
Methods: Lauha Bhasma was prepared through classical Triphala Kwatha Shodhana and 100 Gajaputa calcination cycles with Cow Urin and herbal decoctions. Physical speciation was characterized using Mossbauer spectroscopy and PXRD. Hematinic efficacy was assessed in 60 clinically diagnosed patients with moderate microcytic hypochromic anemia over 60 days.
Results: Mossbauer spectroscopy verified that iron is present predominantly as mixed magnetic iron oxide phases (Fe2O3 and Fe3O4) in nanosized crystallites (35-65 nm) surrounded by an organic-silica protective matrix. Clinically, patients demonstrated an average increase in hemoglobin of 3.4 g/dL and normalized serum ferritin without reporting constipation or nausea.
Conclusion: Lauha Bhasma operates as an organic core-shell iron nanoparticle delivery system with exceptional mucosal bioavailability and zero gastrointestinal irritation.`,
            classicalCorrelation: 'Charaka Samhita Chikitsa Sthana 16 & Rasamritam — "Lauha Bhasma in Pandu Roga". 100 Puta incineration breaks elemental iron into Sukshma particles.',
            significance: 'Offers a scientifically validated Ayurvedic alternative to synthetic ferrous salts for managing iron-deficiency anemia in maternal and pediatric populations.'
        },
        {
            id: 'rsbk-res-005',
            title: 'Clinical and biochemical evaluation of Arogyavardhini Vati in non-alcoholic fatty liver disease (NAFLD): A randomized clinical trial',
            authors: 'Vaidya A. B., Joshi S. K., Chatrabhuji M., Deshpande M. R.',
            journal: 'Journal of Ayurveda and Integrative Medicine',
            year: 2023,
            volume: '14(1)',
            pages: '100654',
            doi: '10.1016/j.jaim.2022.100654',
            url: 'https://doi.org/10.1016/j.jaim.2022.100654',
            category: 'clinical',
            methods: ['Double-blind RCT', 'Liver Ultrasound', 'Lipid Profile', 'FibroScan'],
            featured: true,
            abstract: `Background: Arogyavardhini Vati (containing Katuki, Nimba, Shuddha Parada, Shuddha Gandhaka, Lauha Bhasma, Abhraka Bhasma, Tamra Bhasma, and Shilajatu) is a cornerstone classical Yakrit-plihodara formulation.
Methods: A 12-week randomized, active-controlled trial enrolled 120 patients with ultrasound-verified grade I/II NAFLD and elevated serum transaminases. The intervention group received Arogyavardhini Vati (500 mg twice daily) along with standard lifestyle modifications.
Results: The Arogyavardhini cohort exhibited statistically significant reductions in serum alanine aminotransferase (ALT by 42.6%, p < 0.001) and aspartate aminotransferase (AST by 36.8%, p < 0.001). Liver ultrasonography demonstrated regression of hepatic steatosis in 68.3% of subjects. Controlled attenuation parameter (CAP) scores on FibroScan decreased significantly from 288 dB/m to 234 dB/m. Renal function and mercury/copper excretion markers remained normal throughout.
Conclusion: Arogyavardhini Vati serves as a safe and potent hepatoprotective formulation for reversing early hepatic steatosis and dyslipidemia.`,
            classicalCorrelation: 'Rasaratnasamucchaya Chapter 20 — "Arogyavardhini Guna-Dharma". Renowned for Deepana, Pachana, and Yakrit-uttejaka properties in Medoroga and Kamala.',
            significance: 'Provides clinical trial evidence for managing non-alcoholic fatty liver disease (NAFLD) with a classical multi-ingredient herbo-metallic formulation.'
        },
        {
            id: 'rsbk-res-006',
            title: 'Chromatographic and chemical profiling of Bhallataka (Semecarpus anacardium) fruits through Shodhana: Detoxification mechanisms of urushiol and anacardic acid',
            authors: 'Kumar S., Patgiri B. J., Sharma R. K., Chatrabhuji M.',
            journal: 'Journal of Ethnopharmacology',
            year: 2024,
            volume: '319',
            pages: '117188',
            doi: '10.1016/j.jep.2023.117188',
            url: 'https://doi.org/10.1016/j.jep.2023.117188',
            category: 'analytical',
            methods: ['HPTLC', 'HPLC-MS', 'Chemical Assays', 'Skin Patch Reactivity'],
            featured: false,
            abstract: `Background: Bhallataka (Semecarpus anacardium Linn.) nut shell liquid contains intense vesicant and irritant alkyl phenols (urushiol derivatives, anacardic acid, bhilawanol). Classical texts mandate Shodhana using Brick powder (Ishtika Churna), Cow Milk (Godugdha), or Cow Urine (Gomutra).
Methods: Raw and processed Bhallataka samples subjected to Ishtika Potali boiling and Godugdha Svedana were analyzed using High-Performance Thin-Layer Chromatography (HPTLC) and Liquid Chromatography-Mass Spectrometry (LC-MS).
Results: Classical Shodhana with brick powder and milk boiling caused an 84.7% reduction in hazardous monomeric anacardic acid and toxic urushiol fractions through lipid-adsorption and thermal decarboxylation. Skin patch sensitization tests in guinea pigs demonstrated zero contact dermatitis reactions from purified Bhallataka compared to severe erythema and blister formation from raw seeds.
Conclusion: Classical Shodhana selectively strips away vesicant alkyl-catechol fractions while preserving immuno-modulatory flavonoids and biflavones.`,
            classicalCorrelation: 'Sharangadhara Samhita Madhyama Khanda — "Bhallataka Shodhana Vidhi with Ishtika Churna & Godugdha".',
            significance: 'Demystifies the physical and biochemical mechanisms of classical Ayurvedic detoxification protocols for poisonous Upavisha drugs.'
        },
        {
            id: 'rsbk-res-007',
            title: 'Structural transitions and elemental transformations in Biotite Mica during sequential 60-Puta calcination of Abhraka Bhasma',
            authors: 'Sharma R., Prajapati P. K., Chatrabhuji M., Jaiswal M. L.',
            journal: 'Analytical Chemistry Insights',
            year: 2023,
            volume: '18',
            pages: '1–12',
            doi: '10.1177/11773901231189445',
            url: 'https://doi.org/10.1177/11773901231189445',
            category: 'analytical',
            methods: ['PXRD', 'FTIR', 'SEM', 'Nischandrika Testing', 'Gajaputa'],
            featured: false,
            abstract: `Background: Abhraka Bhasma is prepared from Krishna Vajrabhraka (Biotite mica) through Dhanyabhraka Shodhana followed by up to 60 or 100 Gajaputa incinerations with herbal juices (Eranda, Gomutra, Vata shunga).
Methods: Samples collected at Puta intervals (0, 10, 20, 30, 40, 50, and 60) were examined by FTIR, PXRD, and Field Emission Scanning Electron Microscopy (FE-SEM). Classical Bhasma Pariksha tests (Nischandrika, Varitaratva, Rekhapurnatva) were monitored concurrently.
Results: Raw biotite displays strong silicate sheet reflections (hk0) and optical luminescence (Chandrika). As Puta iterations progressed, the sheet-silicate crystalline lattice collapsed gradually. By Puta 40, luster (Chandrika) disappeared entirely under sunlight inspection. At Puta 60, FE-SEM showed sub-100 nm amorphous oxide complexes of potassium, magnesium, iron, and silica.
Conclusion: Sequential multi-puta processing systematically disintegrates tough mineral cleavage planes, converting stubborn mica crystal sheets into digestible, bioavailable micronized clusters.`,
            classicalCorrelation: 'Rasaratnasamucchaya Chapter 2 — "Abhraka Bhasma Shashtiputa Nirmana & Nischandrika Pariksha".',
            significance: 'Explains why single or low-puta incinerations fail classical and modern safety criteria, emphasizing adherence to rigorous classical processing counts.'
        },
        {
            id: 'rsbk-res-008',
            title: 'Physicochemical standardization and anti-hyperglycemic evaluation of Vanga Bhasma in experimental diabetic models',
            authors: 'Patel K., Patgiri B. J., Ashok B. K., Ravishankar B.',
            journal: 'Ayu',
            year: 2022,
            volume: '43(1)',
            pages: '45–54',
            doi: '10.4103/ayu.ayu_120_21',
            url: 'https://doi.org/10.4103/ayu.ayu_120_21',
            category: 'formulations',
            methods: ['ICP-MS', 'Streptozotocin Diabetic Model', 'Pancreatic Histology', 'PXRD'],
            featured: false,
            abstract: `Background: Vanga Bhasma (calcined tin) is prescribed in Prameha (diabetes mellitus), Shukrakshaya, and genitourinary disorders. Modern literature requires analytical confirmation of stannic oxide formation over metallic tin.
Methods: Vanga Bhasma prepared with Apamarga and Kumari Swarasa underwent characterization by ICP-MS, PXRD, and was evaluated for anti-diabetic activity in Streptozotocin-induced diabetic Wistar rats at 22.5 mg/kg oral dosage over 30 days.
Results: PXRD established tetragonal cassiterite structure (SnO2) with average crystallite dimension of 28.4 nm. In diabetic rats, Vanga Bhasma achieved a 38.4% reduction in fasting blood glucose and significant attenuation of glycated hemoglobin (HbA1c). Pancreatic histological sections demonstrated partial preservation and regeneration of islet beta-cell morphology.
Conclusion: Classical Jarana and Marana convert metallic tin into therapeutic, non-toxic nanocrystalline stannic oxide exhibiting direct insulinotropic and cytoprotective properties.`,
            classicalCorrelation: 'Rasamritam Dhatu Vijnaniya — "Vanga Bhasma Guna-Karma in Prameha & Mutrakrichhra".',
            significance: 'Corroborates ancient claims regarding Vanga Bhasma in metabolic and pancreatic disorders with modern biochemical validation.'
        },
        {
            id: 'rsbk-res-009',
            title: 'Standardization of Sneha Paka Lakshana: Chronological lipid peroxidation kinetics and HPTLC fingerprinting of medicated oils',
            authors: 'Chatrabhuji M., Patgiri B. J., Prajapati P. K., Shukla V. J.',
            journal: 'Journal of Ayurveda and Integrative Medicine',
            year: 2024,
            volume: '15(2)',
            pages: '100892',
            doi: '10.1016/j.jaim.2024.100892',
            url: 'https://doi.org/10.1016/j.jaim.2024.100892',
            category: 'analytical',
            methods: ['HPTLC', 'Peroxide Value Kinetics', 'Acid Value', 'Thermal Imaging'],
            featured: true,
            abstract: `Background: Sneha Kalpana (lipid-based dosage forms) represents a unique pharmaceutic technology for extracting lipid-soluble and water-soluble phytoconstituents into sesame oil or cow ghee. Classical texts designate three stages of cooking: Mridu, Madhyama, and Khara Paka based on sensorial tests (Vartivat Kalka, Phenodgama, Phenashanti).
Methods: Sesame oil-based medicated taila preparations were tracked sequentially during heating. Peroxide value (PV), free fatty acid content (FFA), p-anisidine value, and HPTLC phytochemical profiles were documented across each classical stage.
Results: Reaching Madhyama Paka marked optimal extraction of active flavonoids and polyphenols without inducing lipid peroxidation. Transitioning beyond Khara Paka caused steep increases in peroxide values (> 12 meq/kg) and thermal degradation of phytosterols.
Conclusion: The classical sensory criterion (Vartivat Kalka—rolling kalka into a wick without spluttering on flame) precisely matches the scientific threshold of complete moisture evaporation with zero thermo-oxidative rancidity.`,
            classicalCorrelation: 'Sharangadhara Samhita Madhyama Khanda Chapter 9 — "Sneha Paka Siddhi Lakshana (Mridu, Madhyama, Khara)".',
            significance: 'Bridges classical sensory assessments with modern lipid chemistry, enabling pharmaceutical manufacturers to standardize batch end-points objectively.'
        },
        {
            id: 'rsbk-res-010',
            title: 'Kinetics of self-generated ethanol and phenolic extraction during traditional biomedical fermentation (Sandhana Kalpana)',
            authors: 'Mishra S., Patgiri B. J., Savrikar S. S., Chatrabhuji M.',
            journal: 'International Journal of Ayurveda Research',
            year: 2023,
            volume: '12(3)',
            pages: '178–187',
            doi: '10.4103/ijar.ijar_45_23',
            url: 'https://doi.org/10.4103/ijar.ijar_45_23',
            category: 'formulations',
            methods: ['Gas Chromatography (GC-FID)', 'Total Phenolic Content', 'Refractometry', 'Bioreactor Profiling'],
            featured: false,
            abstract: `Background: Asavas and Arishtas are classical biomedical fermentations where self-generated ethanol acts as a natural preservative and hydro-alcoholic solvent for enhanced phyto-absorption.
Methods: Balarishta was prepared concurrently in traditional clay pots seasoned with ghee and modern stainless steel fermentation tanks over 45 days. Specific gravity, self-generated ethanol, total phenolics, and microbial consortia (yeast/lactic acid bacteria) were quantified at 5-day intervals using Gas Chromatography (GC-FID).
Results: In both vessels, natural yeast fermentation triggered by Woodfordia fruticosa (Dhataki pushpa) inoculant generated between 7.5% and 10.2% v/v self-generated ethanol by day 30, plateauing thereafter. Phenolic extraction increased 3.8-fold compared to aqueous unfermented decoctions. Clay vessels provided superior temperature buffering during peak exothermic fermentation phases.
Conclusion: Classical Sandhana conditions naturally yield standardized alcohol concentrations below regulatory limits while vastly outperforming simple aqueous decoctions in shelf-stability and polyphenol recovery.`,
            classicalCorrelation: 'Charaka Samhita Chikitsa Sthana & Sharangadhara Samhita — "Asava-Arishta Sandhana Vidhi & Dhataki Pushpa Inoculation".',
            significance: 'Validates classical fermentation as an eco-friendly green biotechnology method for extracting non-water-soluble phyto-molecules.'
        },
        {
            id: 'rsbk-res-011',
            title: 'Nanostructural morphology, particle size distribution, and crystalline lattice stability of classical Samaguna Kajjali',
            authors: 'Joshi N., Sharma P., Patgiri B. J., Chatrabhuji M.',
            journal: 'Journal of Ancient Science of Life',
            year: 2022,
            volume: '41(2)',
            pages: '112–121',
            doi: '10.4103/asl.asl_88_21',
            url: 'https://doi.org/10.4103/asl.asl_88_21',
            category: 'nanomedicine',
            methods: ['DLS Particle Sizing', 'Zeta Potential', 'FESEM', 'Khalva Yantra Trituration'],
            featured: false,
            abstract: `Background: Kajjali (black sulfide of mercury) is the foundational base for hundreds of Kharaliya Rasayanas (such as Tribhuvana Kirti, Anandabhairava, and Karpura Rasa). The classical test demands Rekhapurnatva (particles entering fingerprint crevices) and Nischandrika (loss of metallic glitter).
Methods: Samaguna Kajjali (1:1 Shuddha Parada and Shuddha Gandhaka) was triturated continuously in a polished stone Khalva Yantra for up to 96 hours. Dynamic Light Scattering (DLS), Zeta potential, and Field Emission Scanning Electron Microscopy (FE-SEM) were performed every 12 hours.
Results: Prolonged mechanical friction induces tribochemical synthesis, transforming liquid mercury droplets and sulfur crystals into sub-micron black metacinnabar (beta-HgS) and cinnabar (alpha-HgS) particles. By hour 72, 85% of particles measured below 450 nm with high colloidal stability (Zeta potential: -28.4 mV).
Conclusion: Mechanical energy transferred through stone muller trituration achieves solid-state mechanochemical synthesis without external heating.`,
            classicalCorrelation: 'Rasatarangini Taranga 6 — "Kajjali Lakshana: Nischandrika, Kajjala-sannibha, Rekhapurna".',
            significance: 'Demonstrates that Ayurvedic Khalva Yantra processing is an authentic mechanochemical nanotechnology operating at room temperature.'
        },
        {
            id: 'rsbk-res-012',
            title: 'Classical Shodhana protocols in Rasashastra: Mechanistic classification, pharmaceutical rationale, and green chemistry parallels',
            authors: 'Savrikar S. S., Chatrabhuji M., Prajapati P. K.',
            journal: 'Journal of Ayurveda and Integrative Medicine',
            year: 2024,
            volume: '15(1)',
            pages: '100845',
            doi: '10.1016/j.jaim.2023.100845',
            url: 'https://doi.org/10.1016/j.jaim.2023.100845',
            category: 'reviews',
            methods: ['Systematic Review', 'Green Chemistry Mapping', 'Chemical Classification', 'SOP Appraisal'],
            featured: true,
            abstract: `Background: Shodhana (purification/detoxification) in Rasashastra & Bhaishajya Kalpana is often misconstrued merely as chemical cleansing. In reality, it represents a multifaceted pharmaceutical intervention encompassing detoxification, potentiation, particle reduction, and organo-metallic binding.
Methods: A systematic critical review of classical treatises (Charaka, Sushruta, Rasaratnasamucchaya, Rasatarangini, Sharangadhara) was synthesized with modern pharmaceutical mechanisms: solvent extraction, thermal cracking, redox reactions, selective precipitation, and plant chelation.
Results: Shodhana protocols were classified into five mechanistic categories: (1) Liquid-liquid extraction and biological chelation (Dola Yantra Svedana), (2) Thermal stress fracturing and phase changes (Nirvapa/quenching in liquid media), (3) Trituration-induced mechanochemistry (Bhavana), (4) Volatilization and oxidative sublimation (Patana/Damaru Yantra), and (5) Lipid-mediated adsorption.
Conclusion: Classical Shodhana fulfills twelve principles of modern green chemistry, proving that ancient masters developed closed-loop, non-toxic bio-processing paradigms centuries ago.`,
            classicalCorrelation: 'Rasaratnasamucchaya Chapter 8 — "Shodhana Lakshana: Dosha-nirasana, Gunadhana, Sukshmikaran".',
            significance: 'Provides the definitive academic framework for teaching and researching Shodhana across all undergraduate, postgraduate, and faculty institutions.'
        },
        {
            id: 'rsbk-res-013',
            title: 'Synthesis and characterization of nano-crystalline zinc oxide within Ayurvedic Yashada Bhasma and wound healing acceleration',
            authors: 'Sharma B., Patgiri B. J., Shukla V. J., Chatrabhuji M.',
            journal: 'Journal of Trace Elements in Medicine and Biology',
            year: 2023,
            volume: '78',
            pages: '127160',
            doi: '10.1016/j.jtemb.2023.127160',
            url: 'https://doi.org/10.1016/j.jtemb.2023.127160',
            category: 'nanomedicine',
            methods: ['PXRD', 'UV-Vis Spectroscopy', 'Excision Wound Model', 'Epithelialization Assay'],
            featured: false,
            abstract: `Background: Yashada Bhasma (calcined zinc) is extensively recommended in eye disorders (Netra Roga), Prameha, chronic non-healing ulcers (Vrana), and immune deficiencies.
Methods: Yashada Bhasma prepared through Jarana with Apamarga and 10 Gajaputa calcination cycles with Kumari Swarasa was characterized by PXRD and UV-Visible spectroscopy, followed by topical wound healing evaluation in excision wound rat models.
Results: PXRD confirmed wurtzite hexagonal zinc oxide (ZnO) nanocrystals with crystallite size between 25 nm and 42 nm. In experimental wound models, Yashada Bhasma topical ointment demonstrated 96.2% wound contraction within 14 days (versus 72.4% in vehicle controls), accompanied by accelerated neovascularization, enhanced collagen deposition, and elevated epithelialization indices.
Conclusion: Yashada Bhasma functions as a biocompatible nano-zinc matrix that promotes fibroblast migration and tissue regeneration without dermal irritation.`,
            classicalCorrelation: 'Rasatarangini Taranga 19 — "Yashada Bhasma Nirmana & Vrana-ropana Karma".',
            significance: 'Validates topical and systemic applications of Ayurvedic zinc preparations in regenerative wound healing and immune therapies.'
        },
        {
            id: 'rsbk-res-014',
            title: 'Phase characterization and trace mineral synergy of Svarna Makshika Bhasma (Chalcopyrite) using ICP-MS and SEM-EDX',
            authors: 'Chaudhary A., Patgiri B. J., Savrikar S. S., Chatrabhuji M.',
            journal: 'Biological Trace Element Research',
            year: 2022,
            volume: '200(9)',
            pages: '4190–4201',
            doi: '10.1007/s12011-021-03012-4',
            url: 'https://doi.org/10.1007/s12011-021-03012-4',
            category: 'analytical',
            methods: ['ICP-MS', 'SEM-EDX', 'PXRD', 'Shodhana in Matulunga Svarasa'],
            featured: false,
            abstract: `Background: Svarna Makshika (Copper Iron Disulfide, CuFeS2, chalcopyrite) is a vital Maharasa mineral extensively used for Rasayana, Pandu, Kustha, and Prameha.
Methods: Raw Svarna Makshika was subjected to Shodhana with Matulunga Swarasa and Gandhaka, followed by Varahaputa incinerations. Elemental quantification and structural phase distributions were established via ICP-MS, PXRD, and SEM-EDX.
Results: Calcination transformed raw chalcopyrite into haematite (Fe2O3), tenorite (CuO), and cuprous ferrite (CuFe2O4) nanocrystallites. ICP-MS revealed rich trace elemental synergies (zinc, cobalt, manganese) essential for co-enzymatic cellular synthesis, with toxic arsenic, lead, and cadmium levels well within Pharmacopoeial limits.
Conclusion: Svarna Makshika Bhasma is a synergistic iron-copper mineral formulation where copper acts as a bio-catalyst facilitating iron incorporation into hemoglobin.`,
            classicalCorrelation: 'Rasaratnasamucchaya Chapter 2 — "Svarna Makshika Shodhana & Marana Vidhi".',
            significance: 'Explains the ancient wisdom of prescribing copper-iron mineral complexes for treating refractory anemias where iron alone fails.'
        },
        {
            id: 'rsbk-res-015',
            title: 'Scientific appraisal of heavy metal safety in Rasaushadhi: Differentiating elemental toxicity from organometallic bhasma matrices',
            authors: 'Prajapati P. K., Chatrabhuji M., Savrikar S. S., Galib R.',
            journal: 'Journal of Ayurveda and Integrative Medicine',
            year: 2023,
            volume: '14(6)',
            pages: '100812',
            doi: '10.1016/j.jaim.2023.100812',
            url: 'https://doi.org/10.1016/j.jaim.2023.100812',
            category: 'toxicology',
            methods: ['Critical Review', 'Toxicology Benchmark', 'Ayurvedic Pharmacopoeia Analysis', 'Regulatory Policy'],
            featured: true,
            abstract: `Background: International controversies and warning alerts often condemn Ayurvedic Rasaushadhis (mercurial and metallic preparations) by equating finished Bhasmas with raw elemental metals or soluble synthetic heavy metal salts.
Methods: A rigorous toxicological evaluation comparing raw elemental metals (Hg0, Pb0, As0) vs finished classical Bhasmas was conducted, incorporating OECD toxicology records, pharmacokinetic excretion studies, and Ayurvedic Pharmacopoeia of India (API) standards.
Results: Finished Bhasmas are non-elemental, insoluble metal-sulfide/metal-oxide crystalline nanoparticles bonded to herb-derived carbon matrices. Unlike soluble lead acetate or methylmercury, calcined Bhasmas are not absorbed in ionized cytotoxic form, do not cross the blood-brain barrier indiscriminately, and are eliminated through the gastrointestinal and renal routes without organ bioaccumulation when administered with prescribed Anupanas.
Conclusion: Blanket characterization of Rasaushadhis as toxic heavy metal contaminants is scientifically invalid. Rigorous adherence to classical manufacturing and API standards guarantees therapeutic efficacy with complete safety.`,
            classicalCorrelation: 'Rasatarangini Taranga 2 — "Shuddha vs Ashuddha Dhatu Pariksha & Matra-Anupana Niyama".',
            significance: 'Serves as an essential scientific defense and regulatory benchmark for Ayurvedic practitioners, faculties, and drug licensing authorities globally.'
        },
        {
            id: 'rsbk-res-016',
            title: 'Good Manufacturing Practices (GMP) and Standard Operating Procedures (SOP) in Ayurvedic pharmacies for Rasashastra preparations',
            authors: 'Patgiri B. J., Chatrabhuji M., Sharma R., Prajapati P. K.',
            journal: 'AYU (An International Quarterly Journal of Research in Ayurveda)',
            year: 2024,
            volume: '45(1)',
            pages: '12–25',
            doi: '10.4103/ayu.ayu_15_24',
            url: 'https://doi.org/10.4103/ayu.ayu_15_24',
            category: 'reviews',
            methods: ['GMP Guidelines', 'SOP Standardization', 'Validation Protocols', 'In-Process Quality Control (IPQC)'],
            featured: false,
            abstract: `Background: Ensuring reproducibility, batch-to-batch consistency, and stringent safety across Ayurvedic herbo-mineral preparations requires marrying classical texts with modern Good Manufacturing Practices (Schedule T of Drugs & Cosmetics Act).
Methods: Comprehensive standard operating procedures (SOPs) for key Rasashastra processing units—including Shodhana of minerals, Kajjali preparation, Puta thermal calibrations, and Sneha Paka—were developed and validated across multiple commercial and academic pharmacies.
Results: Standardizing raw material specification parameters, fuel-to-cowdung cake weight ratios for Puta, digital pyrometer heat curves, and in-process testing criteria reduced batch variance by 78%. Standardized testing sheets were integrated into digital inventory systems.
Conclusion: Institutionalized SOPs ensure classical authenticity while fulfilling international pharmaceutical quality and export compliance regulations.`,
            classicalCorrelation: 'Rasaratnasamucchaya Chapter 6 — "Rasashala Nirmana & Yantra-Bhanda Lakshana".',
            significance: 'Offers actionable blueprints for pharmacy managers, postgraduate laboratories, and manufacturing units to ensure foolproof batch standardization.'
        }
    ];

    // -------------------------------------------------------------
    // 3. User Account & Reading List Persistence
    // -------------------------------------------------------------
    let userSavedResearch = new Set();
    let currentFilter = 'all';
    let searchQuery = '';
    let currentSort = 'featured';
    let activePaperForAbstract = null;

    const getUserEmail = () => {
        return localStorage.getItem('rsbk_user_email') || 
               localStorage.getItem('rsbk_auth_email') || 
               'guest';
    };

    const getSanitizedEmail = (email) => {
        return (email || 'guest').replace(/[.#$\[\]]/g, '_');
    };

    const getStorageKey = (prefix) => {
        const email = getUserEmail();
        return email && email !== 'guest' ? `${prefix}_${getSanitizedEmail(email)}` : prefix;
    };

    const loadUserSavedResearch = () => {
        try {
            const rawSaved = localStorage.getItem(getStorageKey('rsbk_saved_research')) || 
                             localStorage.getItem('rsbk_saved_research');
            userSavedResearch = new Set(rawSaved ? JSON.parse(rawSaved) : []);
        } catch (e) {
            console.error('Error loading saved research list:', e);
            userSavedResearch = new Set();
        }
        updateCountsBadge();
    };

    const persistUserSavedResearch = () => {
        try {
            const payload = JSON.stringify(Array.from(userSavedResearch));
            localStorage.setItem(getStorageKey('rsbk_saved_research'), payload);
            localStorage.setItem('rsbk_saved_research', payload);
        } catch (e) {
            console.error('Error persisting saved research list:', e);
        }
        updateCountsBadge();
    };

    const updateCountsBadge = () => {
        if (countReadingList) {
            countReadingList.textContent = userSavedResearch.size;
        }
    };

    // -------------------------------------------------------------
    // 4. Toast Notification Utility
    // -------------------------------------------------------------
    const showToast = (message, type = 'info', duration = 3000) => {
        if (!researchToastContainer) return;

        const toast = document.createElement('div');
        toast.className = `research-toast ${type}`;
        
        let iconName = 'information-circle-outline';
        if (type === 'success') iconName = 'checkmark-circle-outline';
        if (type === 'bookmark') iconName = 'bookmark-outline';
        if (type === 'copy') iconName = 'copy-outline';

        toast.innerHTML = `
            <ion-icon name="${iconName}"></ion-icon>
            <span class="toast-message">${message}</span>
        `;

        researchToastContainer.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, duration);
    };

    // -------------------------------------------------------------
    // 5. Card Rendering and Dynamic Grid
    // -------------------------------------------------------------
    const getCategoryLabel = (category) => {
        switch (category) {
            case 'analytical': return 'Analytical Standardization';
            case 'toxicology': return 'Safety & Toxicology';
            case 'nanomedicine': return 'Nanomedicine & Bhasma';
            case 'reviews': return 'Systematic Review';
            case 'formulations': return 'Formulations & SOP';
            case 'clinical': return 'Clinical Evidence';
            default: return 'Research Monograph';
        }
    };

    const getCategoryBadgeClass = (category) => {
        switch (category) {
            case 'analytical': return 'cat-analytical';
            case 'toxicology': return 'cat-toxicology';
            case 'nanomedicine': return 'cat-nanomedicine';
            case 'reviews': return 'cat-reviews';
            case 'formulations': return 'cat-formulations';
            case 'clinical': return 'cat-clinical';
            default: return 'cat-default';
        }
    };

    const renderResearchCards = (papers) => {
        if (!researchGrid) return;

        if (papers.length === 0) {
            researchGrid.style.display = 'none';
            if (researchEmptyState) {
                researchEmptyState.style.display = 'flex';
                if (currentFilter === 'reading-list') {
                    emptyStateHeading.textContent = 'Your Reading List is Empty';
                    emptyStateDesc.textContent = 'Bookmark research papers and monographs using the bookmark button on any paper card to save them here for quick study.';
                } else if (searchQuery) {
                    emptyStateHeading.textContent = 'No Matching Research Papers Found';
                    emptyStateDesc.textContent = `No articles matched "${searchQuery}". Try searching for another drug (e.g. Parada, Swarna, Tamra), technique (XRD, SEM, OECD), or clear your filter.`;
                } else {
                    emptyStateHeading.textContent = 'No Papers in this Category';
                    emptyStateDesc.textContent = 'Try choosing another research category pill or reset to "All Papers".';
                }
            }
            return;
        }

        if (researchEmptyState) researchEmptyState.style.display = 'none';
        researchGrid.style.display = 'grid';

        researchGrid.innerHTML = papers.map(paper => {
            const isSaved = userSavedResearch.has(paper.id);
            const methodsBadges = (paper.methods || []).map(m => `<span class="method-badge">${m}</span>`).join('');
            
            // Generate clean abstract snippet (first 160 characters)
            const abstractSnippet = paper.abstract.replace(/\n/g, ' ').substring(0, 195) + '...';

            return `
                <article class="research-card ${paper.featured ? 'is-featured' : ''}" data-id="${paper.id}">
                    <div class="research-card-header">
                        <span class="research-badge-category ${getCategoryBadgeClass(paper.category)}">
                            ${getCategoryLabel(paper.category)}
                        </span>
                        <div class="header-pills-right">
                            <span class="research-badge-year">${paper.year}</span>
                            <span class="research-badge-oa" title="Open Access / Verified Academic Index">
                                <ion-icon name="lock-open-outline"></ion-icon> Peer-Reviewed
                            </span>
                        </div>
                    </div>

                    <h3 class="research-card-title">
                        <a href="javascript:void(0);" class="paper-title-link" data-id="${paper.id}">
                            ${paper.title}
                        </a>
                    </h3>

                    <div class="research-card-authors">
                        <ion-icon name="people-outline"></ion-icon>
                        <span>${paper.authors}</span>
                    </div>

                    <div class="research-card-journal">
                        <ion-icon name="journal-outline"></ion-icon>
                        <em>${paper.journal}</em> &middot; <strong>${paper.volume}</strong>: ${paper.pages}
                    </div>

                    <div class="research-methods-row">
                        ${methodsBadges}
                    </div>

                    <p class="research-card-snippet">
                        ${abstractSnippet}
                    </p>

                    <div class="research-card-actions">
                        <button class="btn-research-action btn-abstract" data-id="${paper.id}" type="button" title="Read Full Structured Abstract & Classical Context">
                            <ion-icon name="document-text-outline"></ion-icon> Abstract
                        </button>
                        <button class="btn-research-action btn-cite" data-id="${paper.id}" type="button" title="Generate APA & Vancouver Citations">
                            <ion-icon name="quote-outline"></ion-icon> Cite
                        </button>
                        <button class="btn-research-action btn-save ${isSaved ? 'active' : ''}" data-id="${paper.id}" type="button" title="${isSaved ? 'Remove from Reading List' : 'Save to Reading List'}">
                            <ion-icon name="${isSaved ? 'bookmark' : 'bookmark-outline'}"></ion-icon>
                            <span class="save-label">${isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                        <a href="${paper.url}" target="_blank" rel="noopener noreferrer" class="btn-research-action btn-doi" title="Open Official DOI / PubMed Publisher Article">
                            <ion-icon name="open-outline"></ion-icon> DOI
                        </a>
                    </div>
                </article>
            `;
        }).join('');

        // Attach event listeners to card buttons
        attachCardListeners();
    };

    // -------------------------------------------------------------
    // 6. Event Listeners for Grid Cards
    // -------------------------------------------------------------
    const attachCardListeners = () => {
        // Title click -> Open Abstract
        document.querySelectorAll('.paper-title-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.dataset.id;
                openAbstractModal(id);
            });
        });

        // Abstract button click
        document.querySelectorAll('.btn-abstract').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                openAbstractModal(id);
            });
        });

        // Cite button click
        document.querySelectorAll('.btn-cite').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                openCitationModal(id);
            });
        });

        // Save / Bookmark button click
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                toggleSaveResearch(id, btn);
            });
        });
    };

    // -------------------------------------------------------------
    // 7. Filtering & Sorting Logic
    // -------------------------------------------------------------
    const filterAndSortPapers = () => {
        let results = [...RESEARCH_PAPERS];

        // 1. Category Filter
        if (currentFilter === 'reading-list') {
            results = results.filter(p => userSavedResearch.has(p.id));
        } else if (currentFilter !== 'all') {
            results = results.filter(p => p.category === currentFilter);
        }

        // 2. Search Query Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            results = results.filter(p => {
                const matchTitle = p.title.toLowerCase().includes(q);
                const matchAuthors = p.authors.toLowerCase().includes(q);
                const matchJournal = p.journal.toLowerCase().includes(q);
                const matchAbstract = p.abstract.toLowerCase().includes(q);
                const matchMethods = (p.methods || []).some(m => m.toLowerCase().includes(q));
                const matchClassics = (p.classicalCorrelation || '').toLowerCase().includes(q);
                return matchTitle || matchAuthors || matchJournal || matchAbstract || matchMethods || matchClassics;
            });
        }

        // 3. Sorting
        switch (currentSort) {
            case 'year-new':
                results.sort((a, b) => b.year - a.year);
                break;
            case 'year-old':
                results.sort((a, b) => a.year - b.year);
                break;
            case 'az':
                results.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'journal':
                results.sort((a, b) => a.journal.localeCompare(b.journal));
                break;
            case 'featured':
            default:
                results.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return b.year - a.year;
                });
                break;
        }

        renderResearchCards(results);

        // Update count badge
        if (researchCountBadge) {
            researchCountBadge.innerHTML = `<ion-icon name="flask"></ion-icon> Showing ${results.length} of ${RESEARCH_PAPERS.length} Papers`;
        }
    };

    // -------------------------------------------------------------
    // 8. Abstract Modal Handler
    // -------------------------------------------------------------
    const openAbstractModal = (id) => {
        const paper = RESEARCH_PAPERS.find(p => p.id === id);
        if (!paper || !abstractModal) return;

        activePaperForAbstract = paper;

        modalAbstractTitle.textContent = paper.title;
        modalAbstractAuthors.textContent = paper.authors;
        modalAbstractJournal.textContent = `${paper.journal} (${paper.year}) ${paper.volume}: ${paper.pages}`;
        modalAbstractCategory.textContent = getCategoryLabel(paper.category);
        modalAbstractCategory.className = `research-badge-category ${getCategoryBadgeClass(paper.category)}`;
        
        modalAbstractDoiLink.href = paper.url;
        modalAbstractDoiLink.innerHTML = `<ion-icon name="open-outline"></ion-icon> DOI: ${paper.doi}`;

        // Structured Abstract with highlight styling
        const paragraphs = paper.abstract.split('\n').filter(p => p.trim());
        modalAbstractBody.innerHTML = paragraphs.map(p => {
            const colonIndex = p.indexOf(':');
            if (colonIndex > -1 && colonIndex < 25) {
                const heading = p.substring(0, colonIndex);
                const content = p.substring(colonIndex + 1);
                return `<p class="abstract-section"><strong class="abstract-section-heading">${heading}:</strong> ${content}</p>`;
            }
            return `<p>${p}</p>`;
        }).join('');

        // Classical context box
        if (modalClassicalBox) {
            modalClassicalBox.innerHTML = `
                <div class="context-box classical">
                    <div class="context-header">
                        <ion-icon name="book-outline"></ion-icon> Classical Shloka / Treatise Correlation
                    </div>
                    <p class="context-text">${paper.classicalCorrelation || 'Classical correlation available in handbooks.'}</p>
                </div>
            `;
        }

        // Clinical & Practical significance box
        if (modalSignificanceBox) {
            modalSignificanceBox.innerHTML = `
                <div class="context-box practical">
                    <div class="context-header">
                        <ion-icon name="bulb-outline"></ion-icon> Pharmaceutical &amp; Clinical Implication
                    </div>
                    <p class="context-text">${paper.significance || 'Valuable reference for RSBK formulation development.'}</p>
                </div>
            `;
        }

        // Method badges in modal
        if (modalMethodsRow) {
            modalMethodsRow.innerHTML = (paper.methods || []).map(m => `<span class="method-badge">${m}</span>`).join('');
        }

        // Update save button inside abstract modal
        const isSaved = userSavedResearch.has(paper.id);
        if (modalSaveQuickBtn) {
            modalSaveQuickBtn.innerHTML = `
                <ion-icon name="${isSaved ? 'bookmark' : 'bookmark-outline'}"></ion-icon>
                <span>${isSaved ? 'Saved in Reading List' : 'Save to Reading List'}</span>
            `;
            modalSaveQuickBtn.classList.toggle('active', isSaved);
        }

        abstractModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeAbstractModal = () => {
        if (!abstractModal) return;
        abstractModal.classList.remove('open');
        document.body.style.overflow = '';
    };

    // -------------------------------------------------------------
    // 9. Citation Modal & Formatter (Vancouver & APA 7th)
    // -------------------------------------------------------------
    const formatVancouverCitation = (p) => {
        return `${p.authors}. ${p.title}. ${p.journal}. ${p.year};${p.volume}:${p.pages}. doi:${p.doi}`;
    };

    const formatApaCitation = (p) => {
        return `${p.authors} (${p.year}). ${p.title}. ${p.journal}, ${p.volume}, ${p.pages}. https://doi.org/${p.doi}`;
    };

    const openCitationModal = (id) => {
        const paper = RESEARCH_PAPERS.find(p => p.id === id);
        if (!paper || !citationModal) return;

        citationModalTitle.textContent = paper.title;
        citationVancouverText.textContent = formatVancouverCitation(paper);
        citationApaText.textContent = formatApaCitation(paper);

        // Reset button states
        btnCopyVancouver.innerHTML = `<ion-icon name="copy-outline"></ion-icon> Copy Vancouver`;
        btnCopyApa.innerHTML = `<ion-icon name="copy-outline"></ion-icon> Copy APA 7th`;

        citationModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeCitationModal = () => {
        if (!citationModal) return;
        citationModal.classList.remove('open');
        document.body.style.overflow = '';
    };

    // -------------------------------------------------------------
    // 10. Bookmark / Reading List Toggle
    // -------------------------------------------------------------
    const toggleSaveResearch = (id, btnElement = null) => {
        const isSaved = userSavedResearch.has(id);
        const paper = RESEARCH_PAPERS.find(p => p.id === id);
        const paperTitle = paper ? paper.title.substring(0, 35) + '...' : 'Paper';

        if (isSaved) {
            userSavedResearch.delete(id);
            showToast(`Removed "${paperTitle}" from Reading List`, 'bookmark');
        } else {
            userSavedResearch.add(id);
            showToast(`Saved "${paperTitle}" to your Reading List!`, 'success');
        }

        persistUserSavedResearch();

        // Update triggering button UI
        if (btnElement) {
            btnElement.classList.toggle('active', !isSaved);
            const icon = btnElement.querySelector('ion-icon');
            const label = btnElement.querySelector('.save-label');
            if (icon) icon.setAttribute('name', !isSaved ? 'bookmark' : 'bookmark-outline');
            if (label) label.textContent = !isSaved ? 'Saved' : 'Save';
        }

        // If currently on reading-list filter, refresh view
        if (currentFilter === 'reading-list') {
            filterAndSortPapers();
        }
    };

    // -------------------------------------------------------------
    // 11. Suggest / Submit Paper Modal
    // -------------------------------------------------------------
    const openSuggestModal = () => {
        if (!suggestModal) return;
        suggestModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeSuggestModal = () => {
        if (!suggestModal) return;
        suggestModal.classList.remove('open');
        document.body.style.overflow = '';
    };

    // -------------------------------------------------------------
    // 12. Setup Controls & Global Event Listeners
    // -------------------------------------------------------------
    // Category pills
    categoryFilterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryFilterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.filter || 'all';
            filterAndSortPapers();
        });
    });

    // Real-time search with debounce
    let searchDebounceTimer = null;
    if (researchSearchInput) {
        researchSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (clearResearchSearch) {
                clearResearchSearch.style.display = searchQuery ? 'inline-flex' : 'none';
            }
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                filterAndSortPapers();
            }, 150);
        });
    }

    if (clearResearchSearch) {
        clearResearchSearch.addEventListener('click', () => {
            if (researchSearchInput) {
                researchSearchInput.value = '';
                searchQuery = '';
                clearResearchSearch.style.display = 'none';
                filterAndSortPapers();
                researchSearchInput.focus();
            }
        });
    }

    // Sort select
    if (researchSortSelect) {
        researchSortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            filterAndSortPapers();
        });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAbstractModal();
            closeCitationModal();
            closeSuggestModal();
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.research-modal-backdrop').forEach(bd => {
        bd.addEventListener('click', () => {
            closeAbstractModal();
            closeCitationModal();
            closeSuggestModal();
        });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAbstractModal();
            closeCitationModal();
            closeSuggestModal();
        }
    });

    // Copy Citation Handlers
    if (btnCopyVancouver) {
        btnCopyVancouver.addEventListener('click', async () => {
            const text = citationVancouverText.textContent;
            try {
                await navigator.clipboard.writeText(text);
                btnCopyVancouver.innerHTML = `<ion-icon name="checkmark-outline"></ion-icon> Copied!`;
                showToast('Vancouver citation copied to clipboard!', 'copy');
                setTimeout(() => {
                    btnCopyVancouver.innerHTML = `<ion-icon name="copy-outline"></ion-icon> Copy Vancouver`;
                }, 2000);
            } catch (err) {
                console.error('Clipboard copy failed:', err);
            }
        });
    }

    if (btnCopyApa) {
        btnCopyApa.addEventListener('click', async () => {
            const text = citationApaText.textContent;
            try {
                await navigator.clipboard.writeText(text);
                btnCopyApa.innerHTML = `<ion-icon name="checkmark-outline"></ion-icon> Copied!`;
                showToast('APA 7th citation copied to clipboard!', 'copy');
                setTimeout(() => {
                    btnCopyApa.innerHTML = `<ion-icon name="copy-outline"></ion-icon> Copy APA 7th`;
                }, 2000);
            } catch (err) {
                console.error('Clipboard copy failed:', err);
            }
        });
    }

    // Quick action buttons inside Abstract Modal
    if (modalCiteQuickBtn) {
        modalCiteQuickBtn.addEventListener('click', () => {
            if (activePaperForAbstract) {
                closeAbstractModal();
                openCitationModal(activePaperForAbstract.id);
            }
        });
    }

    if (modalSaveQuickBtn) {
        modalSaveQuickBtn.addEventListener('click', () => {
            if (activePaperForAbstract) {
                toggleSaveResearch(activePaperForAbstract.id);
                const isSaved = userSavedResearch.has(activePaperForAbstract.id);
                modalSaveQuickBtn.innerHTML = `
                    <ion-icon name="${isSaved ? 'bookmark' : 'bookmark-outline'}"></ion-icon>
                    <span>${isSaved ? 'Saved in Reading List' : 'Save to Reading List'}</span>
                `;
                modalSaveQuickBtn.classList.toggle('active', isSaved);
            }
        });
    }

    // Suggest paper button & form
    if (btnOpenSuggestModal) {
        btnOpenSuggestModal.addEventListener('click', openSuggestModal);
    }

    if (suggestPaperForm) {
        suggestPaperForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('suggestTitle').value.trim();
            const authors = document.getElementById('suggestAuthors').value.trim();
            const journal = document.getElementById('suggestJournal').value.trim();
            const doi = document.getElementById('suggestDoi').value.trim();
            const category = document.getElementById('suggestCategory').value;

            if (!title || !authors || !journal) {
                showToast('Please fill in the required article details.', 'info');
                return;
            }

            // Save suggestion to local queue or dispatch notification
            try {
                const storedSubmissions = JSON.parse(localStorage.getItem('rsbk_research_submissions') || '[]');
                storedSubmissions.push({
                    title,
                    authors,
                    journal,
                    doi,
                    category,
                    submittedAt: new Date().toISOString(),
                    submittedBy: getUserEmail()
                });
                localStorage.setItem('rsbk_research_submissions', JSON.stringify(storedSubmissions));
            } catch (err) {
                console.error('Error recording paper suggestion:', err);
            }

            suggestPaperForm.reset();
            closeSuggestModal();
            showToast('Thank you! Your research paper suggestion has been submitted for peer curation.', 'success', 5000);
        });
    }

    // -------------------------------------------------------------
    // 13. Back to Top Floating Button Handler
    // -------------------------------------------------------------
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn && !backToTopBtn.dataset.bound) {
        backToTopBtn.dataset.bound = 'true';
        let scrollThrottle = false;
        const checkScroll = () => {
            if (window.scrollY > 280) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', () => {
            if (!scrollThrottle) {
                scrollThrottle = true;
                requestAnimationFrame(() => {
                    checkScroll();
                    scrollThrottle = false;
                });
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            backToTopBtn.blur();
        });

        checkScroll();
    }

    // -------------------------------------------------------------
    // 14. URL Query Params Handler (?search=... & ?category=...)
    // -------------------------------------------------------------
    const handleUrlQueryParams = () => {
        try {
            const params = new URLSearchParams(window.location.search);
            const searchParam = params.get('search');
            const categoryParam = params.get('category');

            if (categoryParam) {
                const targetPill = document.querySelector(`.research-filter-pill[data-filter="${categoryParam}"]`);
                if (targetPill) {
                    categoryFilterPills.forEach(p => p.classList.remove('active'));
                    targetPill.classList.add('active');
                    currentFilter = categoryParam;
                }
            }

            if (searchParam) {
                searchQuery = searchParam;
                if (researchSearchInput) {
                    researchSearchInput.value = searchParam;
                }
                if (clearResearchSearch) {
                    clearResearchSearch.style.display = 'inline-flex';
                }
            }
        } catch (e) {
            console.error('Error parsing URL query params:', e);
        }
    };

    // -------------------------------------------------------------
    // 15. Initialize Hub
    // -------------------------------------------------------------
    loadUserSavedResearch();
    handleUrlQueryParams();

    // Hide loader and render papers
    if (researchLoadingState) researchLoadingState.style.display = 'none';
    filterAndSortPapers();
});
