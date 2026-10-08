import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart,
  LineController, BarController, DoughnutController,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Legend, Tooltip, Title, Filler
} from 'chart.js';
import '../styles/fortinet.css';

import { KeyInsights, TabHead, HomePage, type InsightItem } from './dashParts';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import fortinetLogo from '../imports/WhatsApp_Image_2026-10-06_at_5.36.40_PM.jpeg';


Chart.register(
  LineController, BarController, DoughnutController,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Legend, Tooltip, Title, Filler
);

// ═══════════════════ DATA ═══════════════════
<<<<<<< HEAD
const WEEKS = ["Dec 31","Jan 07","Jan 14","Jan 21","Jan 28","Feb 04","Feb 11","Feb 18","Feb 25","Mar 04","Mar 11","Mar 18","Mar 25","Apr 01","Apr 08","Apr 15","Apr 22","Apr 29","May 06","May 13","May 20","May 27","Jun 03","Jun 10","Jun 17","Jun 24","Jul 01","Jul 08","Jul 15","Jul 22","Jul 29","Aug 05","Aug 12","Aug 19","Aug 26","Sep 02","Sep 09","Sep 16","Sep 23","Sep 30","Oct 07"];

const CAT_STATS: Record<string, {total:number;valid:number;rank1:number;avg_rank:number;improving:number;declining:number;pct:number|string;tofu_mofu:number;bofu:number;not_ranking:number;tofu_r1:number;bofu_r1:number;isNew?:boolean}> = {
  // Source: Semrush · Oct 07, 2026 · Page 1 & Position 1 · WoW = Sep 30→Oct 07
  // valid = Page 1 (rank 1-10) | rank1 = Position 1 | improving/declining/not_ranking = Sep 30→Oct 07
  "Top Opportunities":{total:49, valid:29, rank1:22, avg_rank:6.9, improving:18, declining:10, pct:59.2, tofu_mofu:48, bofu:1, not_ranking:9, tofu_r1:21, bofu_r1:1},
  "NAC":             {total:80, valid:62, rank1:48, avg_rank:5.1, improving:13, declining:21, pct:77.5, tofu_mofu:72, bofu:8, not_ranking:14, tofu_r1:44, bofu_r1:4},
  "NGFW":            {total:141, valid:126, rank1:82, avg_rank:3.5, improving:19, declining:29, pct:89.4, tofu_mofu:111, bofu:30, not_ranking:4, tofu_r1:70, bofu_r1:12},
  "Zero Trust":      {total:20, valid:18, rank1:15, avg_rank:6.3, improving:6, declining:2, pct:90.0, tofu_mofu:19, bofu:1, not_ranking:0, tofu_r1:15, bofu_r1:0},
  "SD-WAN":          {total:130, valid:94, rank1:53, avg_rank:7.2, improving:41, declining:36, pct:72.3, tofu_mofu:120, bofu:10, not_ranking:20, tofu_r1:52, bofu_r1:1},
  "AI Cybersecurity":{total:136, valid:59, rank1:37, avg_rank:7.5, improving:32, declining:41, pct:43.4, tofu_mofu:112, bofu:24, not_ranking:59, tofu_r1:34, bofu_r1:3,isNew:true},
  "OT Security":     {total:46, valid:34, rank1:26, avg_rank:8.0, improving:14, declining:10, pct:73.9, tofu_mofu:38, bofu:8, not_ranking:4, tofu_r1:22, bofu_r1:4,isNew:true},
  "Quantum Security":{total:28, valid:13, rank1:12, avg_rank:7.6, improving:2, declining:10, pct:46.4, tofu_mofu:28, bofu:0, not_ranking:11, tofu_r1:12, bofu_r1:0,isNew:true},
  "SASE":            {total:30, valid:29, rank1:20, avg_rank:3.0, improving:4, declining:8, pct:96.7, tofu_mofu:28, bofu:2, not_ranking:0, tofu_r1:20, bofu_r1:0,isNew:true}
};

const WEEKLY_R1: Record<string, number[]> = {
  // Source CSV · count of keywords at Rank #1 each week · Dec31→Oct07
  "Top Opportunities":[21,18,20,22,20,16,22,23,27,26,26,18,19,30,28,35,32,28,31,32,29,24,27,22,27,23,23,22,24,19,20,16,19,21,22,13,18,20,18,16,22],
  "NAC":              [48,36,46,49,38,43,44,48,48,50,50,40,47,51,48,54,52,53,51,58,52,41,53,47,59,57,46,46,44,41,33,33,39,35,43,43,37,40,43,49,48],
  "NGFW":             [93,87,89,96,82,75,73,105,92,110,103,95,94,103,105,118,119,109,112,112,105,82,109,114,108,111,103,104,98,99,87,85,98,99,94,93,90,79,108,91,82],
  "Zero Trust":       [13,13,14,14,14,10,9,16,17,13,16,15,13,14,17,16,13,15,16,17,14,12,13,16,12,14,19,16,15,16,17,17,16,12,16,15,14,16,18,11,15],
  "SD-WAN":           [80,54,86,79,64,59,59,75,88,73,73,68,80,96,96,90,96,93,85,80,70,54,67,73,76,75,82,66,69,45,45,53,63,67,65,73,62,42,78,54,53],
  "AI Cybersecurity": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,5,5,4,37,39,44,38,31,32,38,37,37],
  "OT Security":      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,15,15,12,14,17,20,20,19,22,29,22,26],
  "Quantum Security": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,14,16,13,14,15,17,14,14,12,16,15,15,12],
  "SASE":             [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,22,20,17,22,25,22,24,23,20,21,26,23,20]
};

// Weekly average base rank per category · all 41 weeks · Source CSV Oct 07 2026
const WEEKLY_AVG_RANK: Record<string, (number|null)[]> = {
  "Top Opportunities":[7.49,8.19,7.02,8.11,7.81,7.76,6.11,6.36,5.23,4.76,4.98,6.6,4.72,5.0,4.79,4.96,5.54,7.06,5.68,5.69,5.13,5.98,5.76,6.31,4.65,7.5,9.22,8.64,9.25,9.47,8.4,8.18,7.39,7.82,8.73,8.09,9.95,9.17,9.35,9.6,6.88],
  "NAC":              [3.37,5.46,3.97,4.62,5.76,5.97,3.36,3.57,4.57,3.71,4.72,6.53,3.27,3.41,2.84,4.03,4.26,2.87,3.08,3.03,2.53,2.72,2.41,3.05,2.87,2.43,4.07,3.43,3.66,3.68,3.68,3.82,3.72,3.56,3.36,3.49,4.49,3.48,4.79,2.52,5.08],
  "NGFW":             [3.42,3.2,3.06,3.09,3.3,3.34,3.57,2.5,2.52,2.35,2.52,2.64,2.59,2.73,2.7,2.33,2.06,2.41,2.08,2.26,2.26,3.04,2.63,2.15,2.52,2.65,2.25,2.35,2.34,2.45,3.72,2.96,2.64,2.44,2.89,3.06,3.71,3.15,2.71,3.33,3.48],
  "Zero Trust":       [6.8,3.75,3.5,3.0,3.6,3.37,5.95,2.85,2.75,4.8,3.2,3.4,3.3,3.75,2.65,1.95,3.32,2.45,4.15,2.1,2.95,4.05,3.85,2.75,5.4,3.0,1.35,2.35,2.8,2.05,1.8,1.95,2.0,4.1,1.85,3.0,2.75,1.7,1.8,5.45,6.3],
  "SD-WAN":           [6.21,8.11,6.32,6.16,7.45,7.96,6.45,5.95,5.59,6.0,7.36,7.22,3.96,2.91,5.03,4.8,4.98,5.02,5.02,5.74,4.04,5.11,4.5,4.04,4.32,3.66,3.0,3.55,3.68,5.52,5.72,4.19,4.66,4.47,4.59,3.11,3.72,4.75,4.04,5.55,7.21],
  "AI Cybersecurity": [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,6.8,2.9,7.78,8.56,7.22,10.43,11.21,9.85,8.93,8.74,8.65,9.7,8.35,7.48],
  "OT Security":      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.0,7.86,8.63,7.36,5.82,6.18,7.24,6.6,8.07,6.7,7.98,7.43,8.02],
  "Quantum Security": [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,10.48,7.33,4.95,7.32,7.67,5.76,4.25,5.95,6.33,7.14,5.68,4.91,5.64,7.59],
  "SASE":             [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.72,1.86,3.29,3.68,2.97,1.9,2.18,2.23,2.03,2.46,2.66,1.97,1.82,3.0]
};

// Page 1 (rank 1-10) count per week per category · Source CSV Oct 07 2026
const WEEKLY_PAGE1: Record<string, number[]> = {
  "Top Opportunities":[37,36,39,36,35,35,39,37,40,38,41,40,41,41,42,38,37,34,35,39,37,34,35,32,35,35,30,31,31,35,35,31,35,32,31,30,27,30,32,26,29],
  "NAC":              [72,74,72,71,70,70,72,73,71,73,72,70,75,74,73,68,67,75,71,73,73,72,71,70,71,72,70,71,69,70,72,70,70,71,71,71,69,71,67,73,62],
  "NGFW":             [133,132,134,133,131,134,134,135,136,136,135,137,135,135,135,134,137,135,137,135,134,133,132,133,131,131,133,134,135,134,131,133,134,134,130,128,126,129,131,130,126],
  "Zero Trust":       [16,17,18,20,18,19,16,19,19,17,17,18,19,18,19,19,17,20,18,20,20,19,18,19,16,18,20,19,19,20,19,19,20,18,19,18,19,19,20,17,18],
  "SD-WAN":           [110,105,109,107,104,101,108,109,109,109,105,104,109,112,105,107,109,110,107,107,100,100,102,101,99,105,104,104,99,98,101,102,103,103,102,99,99,99,106,97,94],
  "AI Cybersecurity": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,9,7,6,6,58,54,60,52,59,60,57,62,59],
  "OT Security":      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,32,30,35,36,37,39,38,38,40,39,37,34],
  "Quantum Security": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,16,17,14,16,17,17,16,16,16,18,16,18,13],
  "SASE":             [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,27,27,27,27,28,28,29,28,27,27,29,27,29]
=======
const WEEKS = ["Dec 31","Jan 07","Jan 14","Jan 21","Jan 28","Feb 04","Feb 11","Feb 18","Feb 25","Mar 04","Mar 11","Mar 18","Mar 25","Apr 01","Apr 08","Apr 15","Apr 22","Apr 29","May 06","May 13","May 20","May 27","Jun 03","Jun 10","Jun 17","Jun 24","Jul 01","Jul 08","Jul 15","Jul 22","Jul 29","Aug 05","Aug 12","Aug 19","Aug 26","Sep 02","Sep 09","Sep 16","Sep 23","Sep 30"];

const CAT_STATS: Record<string, {total:number;valid:number;rank1:number;avg_rank:number;improving:number;declining:number;pct:number|string;tofu_mofu:number;bofu:number;not_ranking:number;tofu_r1:number;bofu_r1:number;isNew?:boolean}> = {
  // Source: Semrush · Sep 30, 2026 · Page 1 & Position 1 · WoW = Sep 23→Sep 30
  // valid = Page 1 (rank 1-10) | rank1 = Position 1 | improving/declining/not_ranking = Sep 23→Sep 30
  "Top Opportunities":{total:49, valid:26, rank1:16, avg_rank:9.6, improving:12, declining:21, pct:53.1, tofu_mofu:48, bofu:1, not_ranking:6, tofu_r1:16, bofu_r1:0},
  "NAC":              {total:80, valid:73, rank1:49, avg_rank:2.5, improving:21, declining:13, pct:91.2, tofu_mofu:72, bofu:8, not_ranking:5, tofu_r1:48, bofu_r1:1},
  "NGFW":             {total:141, valid:130, rank1:91, avg_rank:3.3, improving:22, declining:33, pct:92.2, tofu_mofu:111, bofu:30, not_ranking:0, tofu_r1:75, bofu_r1:16},
  "Zero Trust":       {total:20, valid:17, rank1:11, avg_rank:5.5, improving:1, declining:8, pct:85.0, tofu_mofu:19, bofu:1, not_ranking:0, tofu_r1:11, bofu_r1:0},
  "SD-WAN":           {total:130, valid:97, rank1:54, avg_rank:5.5, improving:22, declining:45, pct:74.6, tofu_mofu:120, bofu:10, not_ranking:17, tofu_r1:53, bofu_r1:1},
  "AI Cybersecurity": {total:136, valid:62, rank1:37, avg_rank:8.3, improving:34, declining:30, pct:45.6, tofu_mofu:112, bofu:24, not_ranking:47, tofu_r1:28, bofu_r1:9,isNew:true},
  "OT Security":      {total:46, valid:37, rank1:22, avg_rank:7.4, improving:8, declining:15, pct:80.4, tofu_mofu:38, bofu:8, not_ranking:2, tofu_r1:20, bofu_r1:2,isNew:true},
  "Quantum Security": {total:28, valid:18, rank1:15, avg_rank:5.6, improving:4, declining:7, pct:64.3, tofu_mofu:28, bofu:0, not_ranking:6, tofu_r1:15, bofu_r1:0,isNew:true},
  "SASE":             {total:30, valid:27, rank1:23, avg_rank:1.8, improving:2, declining:6, pct:90.0, tofu_mofu:28, bofu:2, not_ranking:2, tofu_r1:23, bofu_r1:0,isNew:true}
};

const WEEKLY_R1: Record<string, number[]> = {
  // Source CSV · count of keywords at Rank #1 each week · Dec31→Sep30
  "Top Opportunities":[21,18,20,22,20,16,22,23,27,26,26,18,19,30,28,35,32,28,31,32,29,24,27,22,27,23,23,22,24,19,20,16,19,21,22,13,18,20,18,16],
  "NAC":              [48,36,46,49,38,43,44,48,48,50,50,40,47,51,48,54,52,53,51,58,52,41,53,47,59,57,46,46,44,41,33,33,39,35,43,43,37,40,43,49],
  "NGFW":             [93,87,89,96,82,75,73,105,92,110,103,95,94,103,105,118,119,109,112,112,105,82,109,114,108,111,103,104,98,99,87,85,98,99,94,93,90,79,108,91],
  "Zero Trust":       [13,13,14,14,14,10,9,16,17,13,16,15,13,14,17,16,13,15,16,17,14,12,13,16,12,14,19,16,15,16,17,17,16,12,16,15,14,16,18,11],
  "SD-WAN":           [80,54,86,79,64,59,59,75,88,73,73,68,80,96,96,90,96,93,85,80,70,54,67,73,76,75,82,66,69,45,45,53,63,67,65,73,62,42,78,54],
  "AI Cybersecurity": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,5,5,4,37,39,44,38,31,32,38,37],
  "OT Security":      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,15,15,12,14,17,20,20,19,22,29,22],
  "Quantum Security": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,14,16,13,14,15,17,14,14,12,16,15,15],
  "SASE":             [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,22,20,17,22,25,22,24,23,20,21,26,23]
};

// Weekly average base rank per category · all 40 weeks · Source CSV Sep 30 2026
const WEEKLY_AVG_RANK: Record<string, (number|null)[]> = {
  "Top Opportunities":[7.49,8.19,7.02,8.11,7.81,7.76,6.11,6.36,5.23,4.76,4.98,6.6,4.72,5.0,4.79,4.96,5.54,7.06,5.68,5.69,5.13,5.98,5.76,6.31,4.65,7.5,9.22,8.64,9.25,9.47,8.4,8.18,7.39,7.82,8.73,8.09,9.95,9.17,9.35,9.6],
  "NAC":              [3.37,5.46,3.97,4.62,5.76,5.97,3.36,3.57,4.57,3.71,4.72,6.53,3.27,3.41,2.84,4.03,4.26,2.87,3.08,3.03,2.53,2.72,2.41,3.05,2.87,2.43,4.07,3.43,3.66,3.68,3.68,3.82,3.72,3.56,3.36,3.49,4.49,3.48,4.79,2.52],
  "NGFW":             [3.42,3.2,3.06,3.09,3.3,3.34,3.57,2.5,2.52,2.35,2.52,2.64,2.59,2.73,2.7,2.33,2.06,2.41,2.08,2.26,2.26,3.04,2.63,2.15,2.52,2.65,2.25,2.35,2.34,2.45,3.72,2.96,2.64,2.44,2.89,3.06,3.71,3.15,2.71,3.33],
  "Zero Trust":       [6.8,3.75,3.5,3.0,3.6,3.37,5.95,2.85,2.75,4.8,3.2,3.4,3.3,3.75,2.65,1.95,3.32,2.45,4.15,2.1,2.95,4.05,3.85,2.75,5.4,3.0,1.35,2.35,2.8,2.05,1.8,1.95,2.0,4.1,1.85,3.0,2.75,1.7,1.8,5.45],
  "SD-WAN":           [6.21,8.11,6.32,6.16,7.45,7.96,6.45,5.95,5.59,6.0,7.36,7.22,3.96,2.91,5.03,4.8,4.98,5.02,5.02,5.74,4.04,5.11,4.5,4.04,4.32,3.66,3.0,3.55,3.68,5.52,5.72,4.19,4.66,4.47,4.59,3.11,3.72,4.75,4.04,5.55],
  "AI Cybersecurity": [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,6.8,2.9,7.78,8.56,7.22,10.43,11.21,9.85,8.93,8.74,8.65,9.7,8.35],
  "OT Security":      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.0,7.86,8.63,7.36,5.82,6.18,7.24,6.6,8.07,6.7,7.98,7.43],
  "Quantum Security": [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,10.48,7.33,4.95,7.32,7.67,5.76,4.25,5.95,6.33,7.14,5.68,4.91,5.64],
  "SASE":             [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.72,1.86,3.29,3.68,2.97,1.9,2.18,2.23,2.03,2.46,2.66,1.97,1.82]
};

// Page 1 (rank 1-10) count per week per category · Source CSV Sep 30 2026
const WEEKLY_PAGE1: Record<string, number[]> = {
  "Top Opportunities":[37,36,39,36,35,35,39,37,40,38,41,40,41,41,42,38,37,34,35,39,37,34,35,32,35,35,30,31,31,35,35,31,35,32,31,30,27,30,32,26],
  "NAC":              [72,74,72,71,70,70,72,73,71,73,72,70,75,74,73,68,67,75,71,73,73,72,71,70,71,72,70,71,69,70,72,70,70,71,71,71,69,71,67,73],
  "NGFW":             [133,132,134,133,131,134,134,135,136,136,135,137,135,135,135,134,137,135,137,135,134,133,132,133,131,131,133,134,135,134,131,133,134,134,130,128,126,129,131,130],
  "Zero Trust":       [16,17,18,20,18,19,16,19,19,17,17,18,19,18,19,19,17,20,18,20,20,19,18,19,16,18,20,19,19,20,19,19,20,18,19,18,19,19,20,17],
  "SD-WAN":           [110,105,109,107,104,101,108,109,109,109,105,104,109,112,105,107,109,110,107,107,100,100,102,101,99,105,104,104,99,98,101,102,103,103,102,99,99,99,106,97],
  "AI Cybersecurity": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,9,7,6,6,58,54,60,52,59,60,57,62],
  "OT Security":      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,32,30,35,36,37,39,38,38,40,39,37],
  "Quantum Security": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,16,17,14,16,17,17,16,16,16,18,16,18],
  "SASE":             [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,27,27,27,27,28,28,29,28,27,27,29,27]
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
};

import { KW, TOP_VOL, CAT_KEYWORDS, GAINERS, DECLINERS, BACKLINK_KWS, NO_BACKLINK_KWS, RANK1_KEYWORDS, FunnelKW, TOP_TOFU_R1_KWS, TOP_BOFU_R1_KWS, solidR1Cats, solidR1, volatileKws } from './keywords';

// Week-over-week stats — CSV "FORT_Week_Over_Week_Rankings…__5_.csv" · Aug 26→Sep 02, 2026
// All 660 keywords · 9 categories · gaining = NR→ranking OR rank improved, declining=rank fell or ranking→NR
// bothNr = keywords where both weeks were NR
type WowStat = {improving:number;declining:number;stable:number;net:number;bothNr:number;tracked:number;total:number};
const WOW_STATS: Record<string, WowStat> = {
<<<<<<< HEAD
  // Week-over-week stats · Sep 30→Oct 07, 2026 · source: 9_Category_With_AIO.csv
  'Top Opportunities': {improving:18, declining:10, stable:17, bothNr:4,  net:8,  tracked:49,  total:49},
  'NAC': {improving:13, declining:21, stable:41, bothNr:5,  net:-8,  tracked:80,  total:80},
  'NGFW': {improving:19, declining:29, stable:93, bothNr:0,  net:-10,  tracked:141,  total:141},
  'Zero Trust': {improving:6, declining:2, stable:12, bothNr:0,  net:4,  tracked:20,  total:20},
  'SD-WAN': {improving:41, declining:36, stable:43, bothNr:10,  net:5,  tracked:130,  total:130},
  'SASE': {improving:4, declining:8, stable:18, bothNr:0,  net:-4,  tracked:30,  total:30},
  'Quantum Security': {improving:2, declining:10, stable:10, bothNr:6,  net:-8,  tracked:28,  total:28},
  'AI Cybersecurity': {improving:32, declining:41, stable:23, bothNr:40,  net:-9,  tracked:136,  total:136},
  'OT Security': {improving:14, declining:10, stable:20, bothNr:2,  net:4,  tracked:46,  total:46},
};

// Top movers per category — Sep 30 → Oct 07 2026
const WOW_MOVERS: Record<string, {gainers:{kw:string;vol:number;from:string;to:string;d:number}[];decliners:{kw:string;vol:number;from:string;to:string;d:number}[]}> = {
  // Top movers per category — Sep 30 → Oct 07 2026 · source: 9_Category_With_AIO.csv · top 3 by highest SV
  'Top Opportunities': {
    gainers:   [{kw:'vpn',vol:673000,from:'12',to:'1',d:11},{kw:'proxy',vol:201000,from:'21',to:'2',d:19},{kw:'what is malware',vol:135000,from:'23',to:'20',d:3}],
    decliners: [{kw:'what is phishing',vol:74000,from:'7',to:'8',d:-1},{kw:'iam',vol:33100,from:'1',to:'26',d:-25},{kw:'phishing definition',vol:27100,from:'20',to:'21',d:-1}],
  },
  'NAC': {
    gainers:   [{kw:'access control',vol:12100,from:'3',to:'1',d:2},{kw:'iot device security',vol:1000,from:'7',to:'1',d:6},{kw:'access control services',vol:720,from:'4',to:'1',d:3}],
    decliners: [{kw:'identity access management',vol:2900,from:'1',to:'26',d:-25},{kw:'what is access control',vol:1000,from:'1',to:'5',d:-4},{kw:'network access control solutions',vol:1000,from:'1',to:'3',d:-2}],
  },
  'NGFW': {
    gainers:   [{kw:'web application firewall',vol:9900,from:'23',to:'11',d:12},{kw:'stateful inspection firewall',vol:1000,from:'3',to:'1',d:2},{kw:'firewall next generation',vol:720,from:'4',to:'1',d:3}],
    decliners: [{kw:'network firewall',vol:3600,from:'17',to:'18',d:-1},{kw:'firewall settings',vol:1900,from:'1',to:'4',d:-3},{kw:'waf security',vol:1300,from:'1',to:'9',d:-8}],
  },
  'Zero Trust': {
    gainers:   [{kw:'zero trust',vol:9900,from:'17',to:'1',d:16},{kw:'zero trust architecture',vol:6600,from:'20',to:'17',d:3},{kw:'zero trust network',vol:1900,from:'5',to:'1',d:4}],
    decliners: [{kw:'what is zero trust',vol:2400,from:'8',to:'76',d:-68},{kw:'zero trust model',vol:1300,from:'1',to:'6',d:-5}],
  },
  'SD-WAN': {
    gainers:   [{kw:'wan',vol:33100,from:'21',to:'6',d:15},{kw:'sd-wan',vol:6600,from:'18',to:'3',d:15},{kw:'sd wan',vol:6600,from:'11',to:'5',d:6}],
    decliners: [{kw:'wan aggregation',vol:260,from:'1',to:'37',d:-36},{kw:'sdn wan',vol:260,from:'1',to:'34',d:-33},{kw:'sd wan cost',vol:210,from:'5',to:'6',d:-1}],
  },
  'SASE': {
    gainers:   [{kw:'Sovereign Sase',vol:40,from:'2',to:'1',d:1},{kw:'Ai Powered Sase',vol:30,from:'11',to:'7',d:4}],
    decliners: [{kw:'Sase Providers',vol:480,from:'1',to:'4',d:-3},{kw:'Sase Vs Casb',vol:390,from:'1',to:'3',d:-2},{kw:'Sase Provider',vol:320,from:'1',to:'6',d:-5}],
  },
  'Quantum Security': {
    gainers:   [{kw:'QKD',vol:880,from:'9',to:'1',d:8},{kw:'what is QKD',vol:40,from:'6',to:'1',d:5}],
    decliners: [{kw:'PQC',vol:1900,from:'4',to:'18',d:-14},{kw:'Cryptographic Agility',vol:140,from:'1',to:'19',d:-18},{kw:'quantum security solutions',vol:40,from:'1',to:'56',d:-55}],
  },
  'AI Cybersecurity': {
    gainers:   [{kw:'AI security',vol:6600,from:'16',to:'1',d:15},{kw:'deepfake ai',vol:5400,from:'21',to:'3',d:18},{kw:'ai cybersecurity',vol:4400,from:'3',to:'1',d:2}],
    decliners: [{kw:'ai data center',vol:5400,from:'1',to:'34',d:-33},{kw:'aiops',vol:5400,from:'25',to:'34',d:-9},{kw:'ai cybersecurity tools',vol:2400,from:'4',to:'7',d:-3}],
  },
  'OT Security': {
    gainers:   [{kw:'what is operational technology',vol:720,from:'4',to:'1',d:3},{kw:'ot environment',vol:390,from:'4',to:'1',d:3},{kw:'ot security companies',vol:210,from:'13',to:'1',d:12}],
    decliners: [{kw:'ot devices',vol:390,from:'1',to:'5',d:-4},{kw:'operational technology definition',vol:140,from:'1',to:'44',d:-43},{kw:'ot security monitoring',vol:110,from:'10',to:'57',d:-47}],
  },
};

// WoW distribution buckets · Sep 30→Oct 07 · ↑20+,↑10-20,↑5-10,↑1-5,Stable,↓1-5,↓5-10,↓10-20,↓20+
// Computed from 9_Category_With_AIO.csv (keywords with both weeks ranked)
const WOW_DIST = [8,25,22,76,277,66,18,8,21];

// All keywords flattened with WoW delta for the full keyword risk table · Sep 30→Oct 07
=======
  // Week-over-week stats · Sep 23→Sep 30, 2026 · source: 9_Category_With_AIO.csv
  'Top Opportunities': {improving:12, declining:21, stable:16, bothNr:3,  net:-9,  tracked:49,  total:49},
  'NAC':               {improving:21, declining:13, stable:46, bothNr:5,  net:8,  tracked:80,  total:80},
  'NGFW':              {improving:22, declining:33, stable:86, bothNr:0,  net:-11,  tracked:141,  total:141},
  'Zero Trust':        {improving:1, declining:8, stable:11, bothNr:0,  net:-7,  tracked:20,  total:20},
  'SD-WAN':            {improving:22, declining:45, stable:63, bothNr:14,  net:-23,  tracked:130,  total:130},
  'SASE':              {improving:2, declining:6, stable:22, bothNr:0,  net:-4,  tracked:30,  total:30},
  'Quantum Security':  {improving:4, declining:7, stable:17, bothNr:6,  net:-3,  tracked:28,  total:28},
  'AI Cybersecurity':  {improving:34, declining:30, stable:72, bothNr:39,  net:4,  tracked:136,  total:136},
  'OT Security':       {improving:8, declining:15, stable:23, bothNr:0,  net:-7,  tracked:46,  total:46},
};

// Top movers per category — Sep 23 → Sep 30 2026
const WOW_MOVERS: Record<string, {gainers:{kw:string;vol:number;from:string;to:string;d:number}[];decliners:{kw:string;vol:number;from:string;to:string;d:number}[]}> = {
  // Top movers per category — Sep 23 → Sep 30 2026 · source: 9_Category_With_AIO.csv · top 3 by highest SV
  'Top Opportunities': {
    gainers:   [{kw:'vpn',vol:673000,from:'13',to:'12',d:1},{kw:'what is malware',vol:135000,from:'25',to:'23',d:2},{kw:'what is phishing',vol:74000,from:'9',to:'7',d:2}],
    decliners: [{kw:'proxy',vol:201000,from:'3',to:'21',d:-18},{kw:'ips',vol:49500,from:'15',to:'21',d:-6},{kw:'wan',vol:33100,from:'1',to:'21',d:-20}],
  },
  'NAC': {
    gainers:   [{kw:'identity access management',vol:2900,from:'23',to:'1',d:22},{kw:'iam identity access management',vol:1900,from:'27',to:'1',d:26},{kw:'what is iam',vol:1900,from:'9',to:'1',d:8}],
    decliners: [{kw:'access control',vol:12100,from:'2',to:'3',d:-1},{kw:'iot device security',vol:1000,from:'1',to:'7',d:-6},{kw:'access control services',vol:720,from:'1',to:'4',d:-3}],
  },
  'NGFW': {
    gainers:   [{kw:'firewalls',vol:5400,from:'4',to:'1',d:3},{kw:'hardware firewall',vol:4400,from:'5',to:'1',d:4},{kw:'ngfw',vol:4400,from:'3',to:'1',d:2}],
    decliners: [{kw:'web application firewall',vol:9900,from:'1',to:'23',d:-22},{kw:'network firewall',vol:3600,from:'1',to:'17',d:-16},{kw:'next generation firewall',vol:2400,from:'1',to:'4',d:-3}],
  },
  'Zero Trust': {
    gainers:   [{kw:'what is zero trust networking',vol:70,from:'8',to:'7',d:1}],
    decliners: [{kw:'zero trust',vol:9900,from:'10',to:'17',d:-7},{kw:'zero trust architecture',vol:6600,from:'1',to:'20',d:-19},{kw:'ztna',vol:5400,from:'1',to:'4',d:-3}],
  },
  'SD-WAN': {
    gainers:   [{kw:'sdn wan',vol:260,from:'3',to:'1',d:2},{kw:'sd wan appliance',vol:210,from:'37',to:'8',d:29},{kw:'sd wan software',vol:140,from:'4',to:'1',d:3}],
    decliners: [{kw:'wan',vol:33100,from:'1',to:'21',d:-20},{kw:'sd-wan',vol:6600,from:'2',to:'18',d:-16},{kw:'sd wan',vol:6600,from:'1',to:'11',d:-10}],
  },
  'SASE': {
    gainers:   [{kw:'Sase Providers',vol:480,from:'13',to:'1',d:12},{kw:'Sase Provider',vol:320,from:'6',to:'1',d:5}],
    decliners: [{kw:'Sase Benefits',vol:720,from:'1',to:'4',d:-3},{kw:'Single Vendor Sase',vol:170,from:'1',to:'3',d:-2},{kw:'Sovereign Sase',vol:40,from:'1',to:'2',d:-1}],
  },
  'Quantum Security': {
    gainers:   [{kw:'quantum encryption',vol:2900,from:'7',to:'1',d:6},{kw:'what is PQC',vol:170,from:'11',to:'1',d:10},{kw:'Cryptographic Agility',vol:140,from:'18',to:'1',d:17}],
    decliners: [{kw:'quantum cryptography',vol:18100,from:'1',to:'25',d:-24},{kw:'post-quantum cryptography',vol:8100,from:'15',to:'24',d:-9},{kw:'PQC',vol:1900,from:'1',to:'4',d:-3}],
  },
  'AI Cybersecurity': {
    gainers:   [{kw:'ai data center',vol:5400,from:'53',to:'1',d:52},{kw:'ai cybersecurity risks',vol:1600,from:'22',to:'19',d:3},{kw:'ai security solutions',vol:1600,from:'17',to:'9',d:8}],
    decliners: [{kw:'aiops',vol:5400,from:'1',to:'25',d:-24},{kw:'deepfake ai',vol:5400,from:'5',to:'21',d:-16},{kw:'ai cybersecurity',vol:4400,from:'2',to:'3',d:-1}],
  },
  'OT Security': {
    gainers:   [{kw:'operational technology security',vol:1000,from:'2',to:'1',d:1},{kw:'ot security meaning',vol:390,from:'2',to:'1',d:1},{kw:'ics/ot',vol:140,from:'87',to:'35',d:52}],
    decliners: [{kw:'what is operational technology',vol:720,from:'1',to:'4',d:-3},{kw:'ot environment',vol:390,from:'1',to:'4',d:-3},{kw:'ot security companies',vol:210,from:'1',to:'13',d:-12}],
  },
};

// WoW distribution buckets · Aug 26→Sep 02 · ↑20+,↑10-20,↑5-10,↑1-5,Stable,↓1-5,↓5-10,↓10-20,↓20+
// Computed from FORT_Week_Over_Week…__5_.csv (560 kws with both weeks ranked)
const WOW_DIST = [14,18,19,63,289,86,37,26,11];

// All keywords flattened with WoW delta for the full keyword risk table · Aug 19→Aug 26
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
const ALL_KW_WOW = (()=>{
  const rows: {keyword:string;category:string;vol:number;aug12:number|null;aug19:number|null;delta:number|null}[] = [];
  for(const [cat,kws] of Object.entries(CAT_KEYWORDS)){
    for(const kw of kws){
<<<<<<< HEAD
      const aug12=kw.ranks[39]??null;  // Sep 30 rank
      const aug19=kw.ranks[40]??null;  // Oct 07 rank
=======
      const aug12=kw.ranks[33]??null;  // Aug 19 rank
      const aug19=kw.ranks[34]??null;  // Aug 26 rank
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
      const delta=(aug12!=null&&aug19!=null)?aug19-aug12:null;
      rows.push({keyword:kw.keyword,category:cat,vol:kw.vol_jan26,aug12,aug19,delta});
    }
  }
  rows.sort((a,b)=>{
    if(a.delta==null&&b.delta==null) return 0;
    if(a.delta==null) return 1;
    if(b.delta==null) return -1;
    return a.delta-b.delta; // most improved (negative delta) first
  });
  return rows;
})();

<<<<<<< HEAD
const WOW_MOVERS_FUNNEL: Record<string,{TOFU:{kw:string,vol:number,from:number,to:number,d:number}[],MOFU:{kw:string,vol:number,from:number,to:number,d:number}[],BOFU:{kw:string,vol:number,from:number,to:number,d:number}[]}> = {
  // Sep 30 → Oct 07 2026 · Source: Wow_Dashboard_Data_-_9_Category.csv · top 3 by highest SV
  'Top Opportunities': {
    TOFU: [{kw:"cybersecurity",vol:201000,from:0,to:24,d:99},{kw:"proxy",vol:201000,from:21,to:2,d:19},{kw:"saml",vol:18100,from:28,to:11,d:17},{kw:"wan",vol:33100,from:21,to:6,d:15},{kw:"sd wan",vol:6600,from:18,to:3,d:15},{kw:"oauth",vol:12100,from:14,to:1,d:13},{kw:"vpn",vol:673000,from:12,to:1,d:11},{kw:"ips",vol:49500,from:21,to:12,d:9},{kw:"single sign on",vol:12100,from:8,to:1,d:7},{kw:"sd wan",vol:6600,from:11,to:5,d:6},{kw:"sdwan",vol:6600,from:5,to:1,d:4},{kw:"what is malware",vol:135000,from:23,to:20,d:3},{kw:"proxy server",vol:33100,from:4,to:1,d:3},{kw:"what is a proxy server",vol:18100,from:3,to:1,d:2},{kw:"two factor authentication",vol:12100,from:15,to:13,d:2},{kw:"access control",vol:12100,from:3,to:1,d:2},{kw:"iot",vol:27100,from:31,to:30,d:1},{kw:"zero day",vol:368000,from:0,to:0,d:0},{kw:"what is a firewall",vol:135000,from:3,to:3,d:0},{kw:"malware",vol:40500,from:16,to:16,d:0},{kw:"ddos",vol:33100,from:1,to:1,d:0},{kw:"ransomware",vol:33100,from:6,to:6,d:0},{kw:"firewall",vol:27100,from:1,to:1,d:0},{kw:"encryption",vol:22200,from:0,to:0,d:0},{kw:"ddos attack",vol:18100,from:1,to:1,d:0},{kw:"Sase",vol:14800,from:1,to:1,d:0},{kw:"phishing email",vol:9900,from:0,to:0,d:0},{kw:"qos",vol:9900,from:1,to:1,d:0},{kw:"byod",vol:9900,from:1,to:1,d:0},{kw:"ddos meaning",vol:8100,from:1,to:1,d:0},{kw:"firewalls",vol:5400,from:1,to:1,d:0},{kw:"how does vpn work",vol:4400,from:1,to:1,d:0},{kw:"what is ips",vol:3600,from:1,to:1,d:0},{kw:"what is ddos",vol:3600,from:1,to:1,d:0},{kw:"802.1 x",vol:1000,from:1,to:1,d:0},{kw:"network firewalls",vol:720,from:1,to:1,d:0},{kw:"ethernet switching",vol:260,from:1,to:1,d:0},{kw:"phishing",vol:49500,from:26,to:0,d:-99},{kw:"multi factor authentication",vol:14800,from:30,to:0,d:-99},{kw:"what is a proxy",vol:12100,from:3,to:0,d:-99},{kw:"malware definition",vol:8100,from:1,to:0,d:-99},{kw:"encryption definition",vol:6600,from:3,to:0,d:-99},{kw:"iam",vol:33100,from:1,to:26,d:-25},{kw:"what is phishing",vol:74000,from:7,to:8,d:-1},{kw:"phishing definition",vol:27100,from:20,to:21,d:-1},{kw:"internet of things",vol:22200,from:28,to:29,d:-1},{kw:"network firewall",vol:3600,from:17,to:18,d:-1}],
    MOFU: [{kw:"vpn service",vol:9900,from:0,to:0,d:0}],
    BOFU: [{kw:"ethernet switch",vol:14800,from:0,to:1,d:99}],
  },
  'NAC': {
    TOFU: [{kw:"iot device security",vol:1000,from:7,to:1,d:6},{kw:"access control methods",vol:260,from:5,to:1,d:4},{kw:"access control services",vol:720,from:4,to:1,d:3},{kw:"access control in network security",vol:90,from:4,to:1,d:3},{kw:"security for iot devices",vol:70,from:4,to:1,d:3},{kw:"access control",vol:12100,from:3,to:1,d:2},{kw:"nac network security",vol:140,from:3,to:1,d:2},{kw:"nac server",vol:20,from:3,to:1,d:2},{kw:"iam definition",vol:260,from:3,to:2,d:1},{kw:"network access control methods",vol:20,from:2,to:1,d:1},{kw:"byod",vol:9900,from:1,to:1,d:0},{kw:"iot security",vol:3600,from:1,to:1,d:0},{kw:"network access control",vol:2900,from:1,to:1,d:0},{kw:"bring your own device",vol:2400,from:0,to:0,d:0},{kw:"iam identity access management",vol:1900,from:1,to:1,d:0},{kw:"access control security",vol:1300,from:9,to:9,d:0},{kw:"nac network",vol:1300,from:1,to:1,d:0},{kw:"internet of things security",vol:880,from:1,to:1,d:0},{kw:"what is iot security",vol:880,from:1,to:1,d:0},{kw:"access control lists",vol:720,from:1,to:1,d:0},{kw:"bring your own device policy",vol:720,from:1,to:1,d:0},{kw:"identity and access management system",vol:720,from:1,to:1,d:0},{kw:"what is identity and access management",vol:590,from:1,to:1,d:0},{kw:"what is network access control",vol:390,from:1,to:1,d:0},{kw:"nac cyber security",vol:390,from:1,to:1,d:0},{kw:"what is nac in networking",vol:390,from:1,to:1,d:0},{kw:"access control definition",vol:320,from:1,to:1,d:0},{kw:"iot network security",vol:320,from:1,to:1,d:0},{kw:"iot network security",vol:320,from:1,to:1,d:0},{kw:"nac security",vol:210,from:1,to:1,d:0},{kw:"network access control system",vol:210,from:1,to:1,d:0},{kw:"nac network access",vol:210,from:1,to:1,d:0},{kw:"how to secure iot devices",vol:170,from:5,to:5,d:0},{kw:"acl firewall",vol:110,from:1,to:1,d:0},{kw:"nac network access control",vol:110,from:1,to:1,d:0},{kw:"nac it",vol:110,from:1,to:1,d:0},{kw:"nac technology",vol:110,from:1,to:1,d:0},{kw:"acls security",vol:110,from:3,to:3,d:0},{kw:"nac tools",vol:50,from:1,to:1,d:0},{kw:"network access control device",vol:50,from:1,to:1,d:0},{kw:"what is iam security",vol:50,from:1,to:1,d:0},{kw:"network access control benefits",vol:50,from:1,to:1,d:0},{kw:"cyber security in iot devices",vol:50,from:1,to:1,d:0},{kw:"what is nac security",vol:30,from:1,to:1,d:0},{kw:"security on iot devices",vol:30,from:1,to:1,d:0},{kw:"cyber security iot devices",vol:30,from:1,to:1,d:0},{kw:"nac computer",vol:20,from:1,to:1,d:0},{kw:"access control methods in computer networks",vol:20,from:4,to:4,d:0},{kw:"nac computer security",vol:20,from:1,to:1,d:0},{kw:"how to secure iot network",vol:20,from:1,to:1,d:0},{kw:"what is iam",vol:1900,from:1,to:0,d:-99},{kw:"access control meaning",vol:260,from:20,to:0,d:-99},{kw:"acls networking",vol:210,from:2,to:0,d:-99},{kw:"access control examples",vol:110,from:1,to:0,d:-99},{kw:"networking acl",vol:90,from:1,to:0,d:-99},{kw:"types of access control list",vol:50,from:7,to:0,d:-99},{kw:"network access control policy",vol:40,from:2,to:0,d:-99},{kw:"benefits of access control list",vol:40,from:1,to:0,d:-99},{kw:"acl access control lists",vol:10,from:1,to:0,d:-99},{kw:"network access control technologies",vol:20,from:1,to:91,d:-90},{kw:"nac security solution",vol:30,from:2,to:82,d:-80},{kw:"identity access management",vol:2900,from:1,to:26,d:-25},{kw:"access control management",vol:720,from:20,to:31,d:-11},{kw:"what is access control",vol:1000,from:1,to:5,d:-4},{kw:"network access control software",vol:320,from:2,to:5,d:-3},{kw:"network access control solutions",vol:1000,from:1,to:3,d:-2},{kw:"network access control list",vol:480,from:1,to:3,d:-2},{kw:"acl network",vol:720,from:1,to:2,d:-1},{kw:"what is an acl networking",vol:210,from:1,to:2,d:-1},{kw:"access control list example",vol:140,from:7,to:8,d:-1},{kw:"access control list in networking",vol:140,from:1,to:2,d:-1}],
    MOFU: [{kw:"access control technologies",vol:880,from:0,to:0,d:0}],
    BOFU: [{kw:"nac solutions",vol:390,from:8,to:1,d:7},{kw:"network access control products",vol:40,from:4,to:1,d:3},{kw:"nac network access control products",vol:20,from:3,to:1,d:2},{kw:"access control solutions",vol:1900,from:0,to:0,d:0},{kw:"iot security solutions",vol:1000,from:1,to:1,d:0},{kw:"access control devices",vol:590,from:0,to:0,d:0},{kw:"iot firewall",vol:70,from:4,to:4,d:0},{kw:"nac service",vol:40,from:0,to:0,d:0}],
  },
  'NGFW': {
    TOFU: [{kw:"waf firewall",vol:480,from:21,to:5,d:16},{kw:"web application firewall",vol:9900,from:23,to:11,d:12},{kw:"layer 7 firewall",vol:390,from:30,to:22,d:8},{kw:"network based firewall",vol:390,from:6,to:1,d:5},{kw:"stateful inspection firewall",vol:1000,from:3,to:1,d:2},{kw:"utm firewall",vol:590,from:2,to:1,d:1},{kw:"firewalls explained",vol:480,from:2,to:1,d:1},{kw:"what is proxy firewall",vol:70,from:2,to:1,d:1},{kw:"what is a firewall",vol:135000,from:3,to:3,d:0},{kw:"firewall",vol:27100,from:1,to:1,d:0},{kw:"firewalls",vol:5400,from:1,to:1,d:0},{kw:"firewall configuration",vol:5400,from:1,to:1,d:0},{kw:"network firewall security",vol:4400,from:1,to:1,d:0},{kw:"hardware firewall",vol:4400,from:1,to:1,d:0},{kw:"network security firewall",vol:2400,from:1,to:1,d:0},{kw:"what does a firewall do",vol:1600,from:1,to:1,d:0},{kw:"stateful firewall",vol:1300,from:1,to:1,d:0},{kw:"what is waf",vol:1300,from:1,to:1,d:0},{kw:"waf meaning",vol:1000,from:1,to:1,d:0},{kw:"stateful vs stateless firewall",vol:1000,from:1,to:1,d:0},{kw:"firewall as a service",vol:1000,from:1,to:1,d:0},{kw:"network firewalls",vol:720,from:1,to:1,d:0},{kw:"stateless vs stateful firewall",vol:720,from:1,to:1,d:0},{kw:"how does a firewall work",vol:590,from:1,to:1,d:0},{kw:"proxy firewall",vol:590,from:1,to:1,d:0},{kw:"stateful firewall vs stateless firewall",vol:590,from:1,to:1,d:0},{kw:"security firewall",vol:390,from:1,to:1,d:0},{kw:"security firewall",vol:390,from:1,to:1,d:0},{kw:"what is a network firewall",vol:320,from:1,to:1,d:0},{kw:"waf vs firewall",vol:320,from:1,to:1,d:0},{kw:"what is firewall in networking",vol:260,from:1,to:1,d:0},{kw:"physical firewall",vol:260,from:1,to:1,d:0},{kw:"what is a stateful firewall",vol:260,from:1,to:1,d:0},{kw:"how firewall works",vol:210,from:1,to:1,d:0},{kw:"firewall as a service providers",vol:210,from:1,to:1,d:0},{kw:"perimeter firewall",vol:210,from:1,to:1,d:0},{kw:"hardware vs software firewall",vol:170,from:4,to:4,d:0},{kw:"hardware firewall vs software firewall",vol:140,from:4,to:4,d:0},{kw:"proxy server firewall",vol:140,from:1,to:1,d:0},{kw:"benefits of firewall",vol:140,from:1,to:1,d:0},{kw:"utm vs firewall",vol:110,from:1,to:1,d:0},{kw:"how firewalls work",vol:90,from:1,to:1,d:0},{kw:"firewall vs waf",vol:90,from:1,to:1,d:0},{kw:"next generation firewall vs utm",vol:90,from:1,to:1,d:0},{kw:"software firewall vs hardware firewall",vol:70,from:4,to:4,d:0},{kw:"what are software firewalls",vol:70,from:1,to:1,d:0},{kw:"next generation firewall vs waf",vol:70,from:1,to:1,d:0},{kw:"what is utm firewall",vol:50,from:1,to:1,d:0},{kw:"firewall vs utm",vol:50,from:1,to:1,d:0},{kw:"border firewall",vol:50,from:1,to:1,d:0},{kw:"benefits of firewall security",vol:50,from:1,to:1,d:0},{kw:"enterprise security firewall",vol:50,from:2,to:2,d:0},{kw:"firewall defined",vol:40,from:2,to:2,d:0},{kw:"configuration of firewall",vol:40,from:1,to:1,d:0},{kw:"how network firewall works",vol:40,from:1,to:1,d:0},{kw:"ngfw definition",vol:40,from:8,to:8,d:0},{kw:"how network firewall is different from application firewall",vol:40,from:1,to:1,d:0},{kw:"application firewall and network firewall",vol:40,from:1,to:1,d:0},{kw:"application proxy firewall",vol:30,from:1,to:1,d:0},{kw:"ngfw networking",vol:30,from:1,to:1,d:0},{kw:"working of firewall",vol:30,from:1,to:1,d:0},{kw:"how hardware firewall works",vol:30,from:1,to:1,d:0},{kw:"ngfw layer 7 firewall",vol:30,from:5,to:5,d:0},{kw:"ngfw vs ips",vol:30,from:1,to:1,d:0},{kw:"firewall utm ngfw",vol:30,from:1,to:1,d:0},{kw:"difference between next generation firewall and standard firewall",vol:30,from:1,to:1,d:0},{kw:"advantages of hardware firewall",vol:30,from:2,to:2,d:0},{kw:"transparent firewalls",vol:20,from:1,to:1,d:0},{kw:"layer 2 firewall",vol:20,from:1,to:1,d:0},{kw:"network firewall definition",vol:20,from:1,to:1,d:0},{kw:"how firewall works in network",vol:20,from:1,to:1,d:0},{kw:"transparent mode firewall",vol:20,from:1,to:1,d:0},{kw:"firewall transparent mode",vol:20,from:1,to:1,d:0},{kw:"difference between application level firewall and network level firewall",vol:20,from:1,to:1,d:0},{kw:"next generation firewalls ngfw",vol:20,from:10,to:10,d:0},{kw:"what is next generation firewalls",vol:40,from:1,to:0,d:-99},{kw:"ngfw network",vol:30,from:11,to:0,d:-99},{kw:"how to setup a firewall",vol:140,from:1,to:25,d:-24},{kw:"waf security",vol:1300,from:1,to:9,d:-8},{kw:"what is the next generation firewall",vol:30,from:1,to:7,d:-6},{kw:"what is next generation firewall ngfw",vol:30,from:1,to:7,d:-6},{kw:"next generation firewall meaning",vol:30,from:1,to:7,d:-6},{kw:"what is next generation firewall",vol:170,from:1,to:5,d:-4},{kw:"firewall settings",vol:1900,from:1,to:4,d:-3},{kw:"next generation firewall ngfw",vol:390,from:1,to:4,d:-3},{kw:"stateless firewall",vol:320,from:2,to:5,d:-3},{kw:"distributed firewall",vol:70,from:1,to:4,d:-3},{kw:"secure web gateway vs next generation firewall",vol:30,from:11,to:14,d:-3},{kw:"network firewall",vol:3600,from:17,to:18,d:-1},{kw:"types of firewall",vol:720,from:8,to:9,d:-1},{kw:"cloud firewall service",vol:210,from:2,to:3,d:-1},{kw:"firewall setup",vol:170,from:1,to:2,d:-1},{kw:"5th generation firewall",vol:30,from:5,to:6,d:-1}],
    MOFU: [{kw:"ngfw tools",vol:20,from:7,to:1,d:6},{kw:"next gen firewall services",vol:70,from:4,to:3,d:1},{kw:"next generation firewall security",vol:40,from:5,to:4,d:1},{kw:"what is enterprise firewall",vol:30,from:9,to:8,d:1},{kw:"next generation firewall software",vol:30,from:3,to:2,d:1},{kw:"features of next generation firewall",vol:70,from:4,to:4,d:0},{kw:"next gen firewall magic quadrant",vol:40,from:1,to:1,d:0},{kw:"advantages to next generation firewalls",vol:30,from:8,to:8,d:0},{kw:"ngfw throughput",vol:30,from:1,to:1,d:0},{kw:"next generation enterprise firewall",vol:30,from:1,to:1,d:0},{kw:"enterprise firewall magic quadrant",vol:30,from:1,to:1,d:0},{kw:"advantages to next generation firewall",vol:30,from:1,to:1,d:0},{kw:"ngfw magic quadrant",vol:20,from:1,to:1,d:0},{kw:"branch office firewall",vol:20,from:3,to:3,d:0},{kw:"ngfw firewall features",vol:20,from:6,to:6,d:0},{kw:"next generation firewall features list",vol:30,from:6,to:15,d:-9},{kw:"next generation firewall benefits",vol:50,from:4,to:5,d:-1}],
    BOFU: [{kw:"enterprise grade firewall",vol:30,from:33,to:17,d:16},{kw:"firewall next generation",vol:720,from:4,to:1,d:3},{kw:"enterprise firewall",vol:320,from:14,to:11,d:3},{kw:"affordable firewall",vol:20,from:13,to:11,d:2},{kw:"business firewall",vol:320,from:2,to:1,d:1},{kw:"layer 3 firewall",vol:70,from:32,to:31,d:1},{kw:"ngfw",vol:4400,from:1,to:1,d:0},{kw:"next generation firewall",vol:2400,from:4,to:4,d:0},{kw:"next gen firewall",vol:2400,from:4,to:4,d:0},{kw:"small business firewall",vol:720,from:1,to:1,d:0},{kw:"firewall cost",vol:90,from:1,to:1,d:0},{kw:"network firewall price",vol:90,from:1,to:1,d:0},{kw:"next generation firewall appliance",vol:90,from:1,to:1,d:0},{kw:"network firewall security price",vol:70,from:1,to:1,d:0},{kw:"firewall security price",vol:30,from:1,to:1,d:0},{kw:"nexgen firewall",vol:30,from:2,to:2,d:0},{kw:"firewall security price in usa",vol:20,from:1,to:1,d:0},{kw:"how much is a network firewall",vol:20,from:2,to:2,d:0},{kw:"low cost firewall",vol:20,from:3,to:3,d:0},{kw:"price of hardware firewall",vol:20,from:1,to:1,d:0},{kw:"physical firewall prices",vol:10,from:1,to:1,d:0},{kw:"ngfw products",vol:30,from:2,to:0,d:-99},{kw:"cheap firewall",vol:20,from:14,to:0,d:-99},{kw:"enterprise firewall router",vol:40,from:1,to:20,d:-19},{kw:"business firewall solutions",vol:50,from:1,to:4,d:-3},{kw:"firewall price comparison",vol:30,from:1,to:4,d:-3},{kw:"next generation application firewall",vol:30,from:2,to:5,d:-3},{kw:"add a next generation firewall",vol:20,from:1,to:4,d:-3},{kw:"firewall price",vol:170,from:1,to:2,d:-1},{kw:"network firewall cost",vol:70,from:1,to:2,d:-1}],
  },
  'SD-WAN': {
    TOFU: [{kw:"managed sd wan solutions",vol:480,from:0,to:53,d:99},{kw:"managed service sd wan",vol:210,from:0,to:26,d:99},{kw:"wan providers",vol:110,from:0,to:35,d:99},{kw:"mpls vs hybrid wan",vol:40,from:20,to:1,d:19},{kw:"wan",vol:33100,from:21,to:6,d:15},{kw:"sd wan",vol:6600,from:18,to:3,d:15},{kw:"wan cost",vol:50,from:32,to:19,d:13},{kw:"sd wan brands",vol:30,from:14,to:3,d:11},{kw:"what is wan",vol:2900,from:8,to:1,d:7},{kw:"sd wan lte",vol:70,from:19,to:12,d:7},{kw:"sd wan",vol:6600,from:11,to:5,d:6},{kw:"sdwan",vol:6600,from:5,to:1,d:4},{kw:"sd wan for enterprise",vol:50,from:5,to:1,d:4},{kw:"sd wan lan",vol:30,from:12,to:8,d:4},{kw:"sd wan explained",vol:720,from:4,to:1,d:3},{kw:"sd wan device",vol:210,from:4,to:1,d:3},{kw:"sd wan pricing",vol:170,from:8,to:5,d:3},{kw:"sd wan pricing model",vol:40,from:6,to:3,d:3},{kw:"sd wan software defined wan",vol:20,from:4,to:1,d:3},{kw:"software defined wan",vol:1600,from:3,to:1,d:2},{kw:"software defined wide area network",vol:260,from:3,to:1,d:2},{kw:"sd wan comparison",vol:110,from:10,to:8,d:2},{kw:"sd wan with mpls",vol:90,from:3,to:1,d:2},{kw:"what does sd wan mean",vol:50,from:3,to:1,d:2},{kw:"sd wan software defined wide area network",vol:30,from:3,to:1,d:2},{kw:"sd wan price list",vol:20,from:11,to:9,d:2},{kw:"sd wan security features",vol:110,from:6,to:5,d:1},{kw:"sd wan vs vpls",vol:30,from:2,to:1,d:1},{kw:"wan definition",vol:6600,from:1,to:1,d:0},{kw:"wide area network",vol:2900,from:1,to:1,d:0},{kw:"what is sd wan",vol:2400,from:1,to:1,d:0},{kw:"what is sd wan",vol:1900,from:1,to:1,d:0},{kw:"sd wan solutions",vol:1600,from:1,to:1,d:0},{kw:"sd wan meaning",vol:1300,from:1,to:1,d:0},{kw:"sd wan vs mpls",vol:880,from:1,to:1,d:0},{kw:"sd wan managed services",vol:880,from:0,to:0,d:0},{kw:"sd wan benefits",vol:480,from:1,to:1,d:0},{kw:"sd wan definition",vol:390,from:1,to:1,d:0},{kw:"sd wan technology",vol:390,from:1,to:1,d:0},{kw:"benefits of sd wan",vol:260,from:1,to:1,d:0},{kw:"sd wan router",vol:260,from:0,to:0,d:0},{kw:"sd wan software",vol:140,from:1,to:1,d:0},{kw:"sd wan explanation",vol:110,from:1,to:1,d:0},{kw:"what is wan aggregation",vol:110,from:1,to:1,d:0},{kw:"define sd wan",vol:70,from:1,to:1,d:0},{kw:"sd wan cost savings",vol:70,from:3,to:3,d:0},{kw:"sd wan appliances",vol:50,from:0,to:0,d:0},{kw:"definition sd wan",vol:50,from:1,to:1,d:0},{kw:"diy sd wan",vol:50,from:1,to:1,d:0},{kw:"difference between sdn and sd wan",vol:50,from:1,to:1,d:0},{kw:"why is sd wan important",vol:50,from:1,to:1,d:0},{kw:"sdwan explained",vol:40,from:1,to:1,d:0},{kw:"sd wan security issues",vol:40,from:6,to:6,d:0},{kw:"sd wan replace mpls",vol:40,from:1,to:1,d:0},{kw:"sd wan vs. mpls",vol:30,from:1,to:1,d:0},{kw:"whats sd wan",vol:30,from:1,to:1,d:0},{kw:"sd wan connectivity",vol:30,from:1,to:1,d:0},{kw:"sd wan what is it",vol:30,from:1,to:1,d:0},{kw:"sd wan price comparison",vol:30,from:9,to:9,d:0},{kw:"difference between wan and sd wan",vol:30,from:8,to:8,d:0},{kw:"why use sd wan",vol:30,from:1,to:1,d:0},{kw:"sd wan concept",vol:30,from:1,to:1,d:0},{kw:"sdn wan vs mpls",vol:30,from:1,to:1,d:0},{kw:"sd-wan aggregation",vol:30,from:1,to:1,d:0},{kw:"sd wan data center",vol:30,from:14,to:14,d:0},{kw:"what is sd wan and how does it work",vol:30,from:1,to:1,d:0},{kw:"sdn wan solutions",vol:20,from:1,to:1,d:0},{kw:"sd-wan aggregation",vol:20,from:1,to:1,d:0},{kw:"managed sd wan",vol:1000,from:2,to:0,d:-99},{kw:"sd wan providers",vol:590,from:12,to:0,d:-99},{kw:"sd wan appliance",vol:210,from:8,to:0,d:-99},{kw:"sdn in the wan",vol:140,from:2,to:0,d:-99},{kw:"mpls to sd wan",vol:90,from:1,to:0,d:-99},{kw:"sd wan as a service pricing",vol:30,from:9,to:0,d:-99},{kw:"what is the difference between wan and mpls",vol:30,from:1,to:0,d:-99},{kw:"sd wan ready",vol:20,from:18,to:0,d:-99},{kw:"sd wan access",vol:30,from:1,to:56,d:-55},{kw:"sd wan security concerns",vol:50,from:1,to:54,d:-53},{kw:"sdn sd wan",vol:20,from:1,to:43,d:-42},{kw:"wan aggregation",vol:260,from:1,to:37,d:-36},{kw:"sdn wan",vol:260,from:1,to:34,d:-33},{kw:"sd wan overview",vol:70,from:1,to:34,d:-33},{kw:"sd wan features comparison",vol:20,from:1,to:6,d:-5},{kw:"sd wan capabilities",vol:40,from:2,to:6,d:-4},{kw:"wan security issues",vol:90,from:1,to:4,d:-3},{kw:"sd wan enterprise edition",vol:20,from:1,to:4,d:-3},{kw:"sd wan over mpls",vol:170,from:1,to:3,d:-2},{kw:"what is managed sd wan",vol:140,from:2,to:4,d:-2},{kw:"diy vs managed sd wan",vol:70,from:1,to:3,d:-2},{kw:"difference between sd wan and wan",vol:30,from:7,to:9,d:-2},{kw:"sd wan cost",vol:210,from:5,to:6,d:-1},{kw:"sd wan requirements",vol:90,from:4,to:5,d:-1},{kw:"is sd wan better than mpls",vol:90,from:2,to:3,d:-1},{kw:"sd wan vs mpls cost comparison",vol:90,from:1,to:2,d:-1},{kw:"wan sd wan",vol:40,from:1,to:2,d:-1},{kw:"sd wan vs firewall",vol:30,from:4,to:5,d:-1},{kw:"wan sdn",vol:20,from:1,to:2,d:-1},{kw:"sd wan cost calculator",vol:20,from:4,to:5,d:-1}],
    MOFU: [{kw:"fully managed sd wan",vol:320,from:0,to:27,d:99},{kw:"business sd wan",vol:140,from:0,to:1,d:99},{kw:"best sd wan providers",vol:90,from:0,to:23,d:99},{kw:"leading sd wan vendors",vol:50,from:0,to:45,d:99},{kw:"sd wan visibility",vol:70,from:92,to:8,d:84},{kw:"sd wan security measures",vol:10,from:6,to:2,d:4},{kw:"wan security measures",vol:70,from:4,to:1,d:3},{kw:"sd wan security measure",vol:20,from:5,to:2,d:3},{kw:"sd wan bandwidth",vol:40,from:5,to:3,d:2},{kw:"sd wan solutions with dynamic routing",vol:30,from:3,to:1,d:2},{kw:"sd wan fec",vol:20,from:7,to:6,d:1},{kw:"sd wan security",vol:720,from:1,to:1,d:0},{kw:"sd wan advantages",vol:210,from:1,to:1,d:0},{kw:"sd wan leaders",vol:90,from:1,to:1,d:0},{kw:"best sd wan vendors",vol:90,from:0,to:0,d:0},{kw:"advantages of sd wan",vol:70,from:1,to:1,d:0},{kw:"sd wan automation",vol:70,from:0,to:0,d:0},{kw:"sd wan vendors",vol:390,from:24,to:0,d:-99},{kw:"cloud managed sd wan",vol:110,from:27,to:0,d:-99},{kw:"sd wan application performance",vol:70,from:1,to:6,d:-5},{kw:"wan security risks",vol:70,from:3,to:6,d:-3},{kw:"cloud sd wan",vol:140,from:4,to:5,d:-1}],
    BOFU: [{kw:"sd wan vendors comparison",vol:90,from:24,to:1,d:23},{kw:"sd wan and cloud",vol:20,from:8,to:6,d:2},{kw:"sd wan companies",vol:210,from:0,to:0,d:0},{kw:"top sd wan providers",vol:110,from:0,to:0,d:0},{kw:"best sd wan",vol:90,from:0,to:0,d:0},{kw:"top sd wan vendors",vol:70,from:0,to:0,d:0},{kw:"sd wan hardware vendors",vol:30,from:0,to:0,d:0},{kw:"sd wan multi cloud",vol:30,from:3,to:3,d:0},{kw:"small business wan",vol:30,from:2,to:2,d:0},{kw:"sd wan for small business",vol:170,from:1,to:29,d:-28}],
  },
  'SASE': {
    TOFU: [{kw:"Sse",vol:14800,from:0,to:1,d:99},{kw:"What Is Sse",vol:1900,from:0,to:1,d:99},{kw:"Sase",vol:14800,from:1,to:1,d:0},{kw:"Sase Meaning",vol:4400,from:1,to:1,d:0},{kw:"What Is Sase",vol:3600,from:1,to:1,d:0},{kw:"Secure Access Service Edge",vol:2900,from:1,to:1,d:0},{kw:"Sase Solutions",vol:1900,from:1,to:1,d:0},{kw:"Security Service Edge",vol:1600,from:1,to:1,d:0},{kw:"Sase Architecture",vol:1300,from:1,to:1,d:0},{kw:"Sase Definition",vol:1000,from:1,to:1,d:0},{kw:"Sase Vs Sse",vol:1000,from:1,to:1,d:0},{kw:"Sase Benefits",vol:720,from:4,to:4,d:0},{kw:"Secure Access Service Edge SASE",vol:480,from:1,to:1,d:0},{kw:"Sase Platform",vol:480,from:1,to:1,d:0},{kw:"Sase Services",vol:390,from:1,to:1,d:0},{kw:"Sase Network",vol:320,from:1,to:1,d:0},{kw:"Sase Network Security",vol:260,from:1,to:1,d:0},{kw:"Sase Vs Ztna",vol:170,from:1,to:1,d:0},{kw:"Sase Vs Vpn",vol:170,from:1,to:1,d:0},{kw:"How Does Sase Work",vol:50,from:1,to:1,d:0},{kw:"Sase Service Provider",vol:30,from:1,to:7,d:-6},{kw:"Sase Provider",vol:320,from:1,to:6,d:-5},{kw:"Sase Vendor",vol:320,from:1,to:6,d:-5},{kw:"Sase Providers",vol:480,from:1,to:4,d:-3},{kw:"Sd-Wan Vs Sase",vol:90,from:1,to:4,d:-3},{kw:"Sase Vs Casb",vol:390,from:1,to:3,d:-2}],
    MOFU: [{kw:"Sovereign Sase",vol:40,from:2,to:1,d:1},{kw:"Ai Sase",vol:40,from:8,to:25,d:-17}],
    BOFU: [{kw:"Ai Powered Sase",vol:30,from:11,to:7,d:4},{kw:"Single Vendor Sase",vol:170,from:3,to:4,d:-1}],
  },
  'AI Cybersecurity': {
    TOFU: [{kw:"what is aiops",vol:1900,from:0,to:1,d:99},{kw:"artificial intelligence data center",vol:480,from:0,to:21,d:99},{kw:"what does aiops stand for",vol:50,from:0,to:21,d:99},{kw:"Generative ai security",vol:720,from:49,to:1,d:48},{kw:"aiops definition",vol:140,from:24,to:1,d:23},{kw:"risks of ai in cybersecurity",vol:110,from:43,to:21,d:22},{kw:"agentic ai security",vol:1000,from:22,to:1,d:21},{kw:"deepfake ai",vol:5400,from:21,to:3,d:18},{kw:"what are aiops",vol:50,from:17,to:1,d:16},{kw:"AI security",vol:6600,from:16,to:1,d:15},{kw:"deepfakes meaning",vol:1000,from:16,to:1,d:15},{kw:"how do deepfakes work",vol:720,from:22,to:18,d:4},{kw:"ai security threats",vol:320,from:5,to:1,d:4},{kw:"ai cybersecurity",vol:4400,from:3,to:1,d:2},{kw:"ai deepfakes",vol:2400,from:9,to:7,d:2},{kw:"ai cybersecurity threats",vol:480,from:14,to:13,d:1},{kw:"AI in cybersecurity",vol:22200,from:1,to:1,d:0},{kw:"ai governance",vol:8100,from:0,to:0,d:0},{kw:"frontier ai",vol:3600,from:0,to:0,d:0},{kw:"ai governance framework",vol:2900,from:0,to:0,d:0},{kw:"ai adoption",vol:2400,from:1,to:1,d:0},{kw:"what is an ai data center",vol:2400,from:0,to:0,d:0},{kw:"cybersecurity and ai",vol:1000,from:1,to:1,d:0},{kw:"what is ai security",vol:720,from:1,to:1,d:0},{kw:"what does deepfake mean",vol:720,from:1,to:1,d:0},{kw:"ai prompt injection",vol:590,from:1,to:1,d:0},{kw:"Artificial intelligence in cybersecurity",vol:390,from:1,to:1,d:0},{kw:"role of ai in cybersecurity",vol:260,from:1,to:1,d:0},{kw:"ai adoption by industry",vol:260,from:0,to:0,d:0},{kw:"ai adoption statistics",vol:260,from:0,to:0,d:0},{kw:"aiops meaning",vol:140,from:1,to:1,d:0},{kw:"artificial intelligence risk management",vol:140,from:0,to:0,d:0},{kw:"ai adoption rate",vol:140,from:0,to:0,d:0},{kw:"what is ai adoption",vol:90,from:1,to:1,d:0},{kw:"what is deepfake ai",vol:70,from:1,to:1,d:0},{kw:"what is ai risk management",vol:50,from:0,to:0,d:0},{kw:"ai security examples",vol:40,from:1,to:1,d:0},{kw:"what is ai in cybersecurity",vol:20,from:1,to:1,d:0},{kw:"how ai security works",vol:0,from:1,to:1,d:0},{kw:"what industries benefit most from ai adoption",vol:0,from:0,to:0,d:0},{kw:"what frameworks guide successful ai adoption",vol:0,from:0,to:0,d:0},{kw:"how can generative ai be used in cybersecurity",vol:880,from:8,to:0,d:-99},{kw:"ai cybersecurity incidents",vol:140,from:2,to:0,d:-99},{kw:"deepfake ai examples",vol:0,from:17,to:0,d:-99},{kw:"ai data center",vol:5400,from:1,to:34,d:-33},{kw:"ai red teaming",vol:880,from:1,to:23,d:-22},{kw:"aiops",vol:5400,from:25,to:34,d:-9},{kw:"ai cybersecurity risks",vol:1600,from:19,to:23,d:-4},{kw:"ai security definition",vol:720,from:4,to:6,d:-2},{kw:"what are ai data centers",vol:1000,from:11,to:12,d:-1},{kw:"ai security risk",vol:320,from:4,to:5,d:-1}],
    MOFU: [{kw:"ai based security system",vol:90,from:0,to:9,d:99},{kw:"deepfake ai best practices",vol:0,from:0,to:8,d:99},{kw:"artificial intelligence security",vol:720,from:13,to:1,d:12},{kw:"ai data center architecture",vol:110,from:13,to:1,d:12},{kw:"adoption of ai for cybersecurity",vol:70,from:10,to:1,d:9},{kw:"ai security monitoring",vol:260,from:8,to:1,d:7},{kw:"ai based security",vol:70,from:7,to:1,d:6},{kw:"ai for cybersecurity",vol:880,from:6,to:1,d:5},{kw:"ai powered cybersecurity",vol:210,from:2,to:1,d:1},{kw:"ai security for enterprise",vol:20,from:9,to:8,d:1},{kw:"deepfake ai risks",vol:0,from:4,to:3,d:1},{kw:"ai in risk management",vol:3600,from:0,to:0,d:0},{kw:"ai risk management",vol:3600,from:0,to:0,d:0},{kw:"ai risk management framework",vol:1300,from:0,to:0,d:0},{kw:"ai risk assessment",vol:1300,from:0,to:0,d:0},{kw:"ai operations",vol:880,from:0,to:0,d:0},{kw:"enterprise ai adoption",vol:720,from:0,to:0,d:0},{kw:"ai adoption challenges",vol:720,from:0,to:0,d:0},{kw:"ai siem",vol:390,from:0,to:0,d:0},{kw:"ai security systems",vol:390,from:5,to:5,d:0},{kw:"ai security best practices",vol:390,from:0,to:0,d:0},{kw:"artificial intelligence for it operations",vol:390,from:1,to:1,d:0},{kw:"artificial intelligence risk management framework",vol:320,from:0,to:0,d:0},{kw:"ai and risk management",vol:260,from:0,to:0,d:0},{kw:"ai for risk management",vol:260,from:0,to:0,d:0},{kw:"generative ai for cybersecurity",vol:170,from:0,to:0,d:0},{kw:"ai adoption in healthcare",vol:170,from:0,to:0,d:0},{kw:"aiops monitoring",vol:140,from:0,to:0,d:0},{kw:"ai model risk management",vol:90,from:0,to:0,d:0},{kw:"deepfake attacks",vol:90,from:1,to:1,d:0},{kw:"enterprise ai adoption trends",vol:90,from:0,to:0,d:0},{kw:"ai impact on data centers",vol:70,from:0,to:0,d:0},{kw:"aiops trends",vol:70,from:0,to:0,d:0},{kw:"ai adoption in financial services",vol:70,from:0,to:0,d:0},{kw:"enterprise ai adoption challenges",vol:50,from:0,to:0,d:0},{kw:"ai and machine learning for risk management",vol:40,from:0,to:0,d:0},{kw:"ai data center trends",vol:30,from:0,to:0,d:0},{kw:"ai security benefits",vol:20,from:1,to:1,d:0},{kw:"ai security use case",vol:0,from:23,to:23,d:0},{kw:"ai cybersecurity applications",vol:0,from:1,to:1,d:0},{kw:"data center challenges in ai",vol:0,from:0,to:0,d:0},{kw:"deepfake ai challenges",vol:0,from:0,to:0,d:0},{kw:"ai adoption framework",vol:1000,from:20,to:0,d:-99},{kw:"generative ai in cybersecurity",vol:480,from:13,to:0,d:-99},{kw:"strategic ai adoption",vol:170,from:1,to:0,d:-99},{kw:"ai security frameworks",vol:140,from:16,to:0,d:-99},{kw:"ai powered security",vol:110,from:3,to:0,d:-99},{kw:"aiops framework",vol:90,from:9,to:0,d:-99},{kw:"aiops capabilities",vol:90,from:1,to:0,d:-99},{kw:"aiops network",vol:70,from:11,to:0,d:-99},{kw:"ai automation in cybersecurity",vol:50,from:5,to:0,d:-99},{kw:"aiops networking",vol:50,from:7,to:0,d:-99},{kw:"benefits of ai data center",vol:40,from:15,to:0,d:-99},{kw:"ai driven security",vol:210,from:7,to:21,d:-14},{kw:"ai secops",vol:110,from:1,to:8,d:-7},{kw:"enterprise aiops",vol:110,from:1,to:7,d:-6},{kw:"ai security challenges",vol:40,from:1,to:6,d:-5},{kw:"ai adoption strategy",vol:480,from:1,to:4,d:-3},{kw:"generative ai adoption",vol:210,from:9,to:12,d:-3},{kw:"preparing for ai adoption",vol:210,from:1,to:4,d:-3},{kw:"deepfake ai technology",vol:20,from:1,to:2,d:-1}],
    BOFU: [{kw:"aiops vendors",vol:210,from:0,to:12,d:99},{kw:"ai security vendor",vol:0,from:0,to:20,d:99},{kw:"aiops tools",vol:1900,from:31,to:13,d:18},{kw:"ai cybersecurity providers",vol:10,from:18,to:8,d:10},{kw:"ai security services",vol:90,from:6,to:1,d:5},{kw:"ai security solutions",vol:1600,from:9,to:9,d:0},{kw:"ai cybersecurity solutions",vol:880,from:1,to:1,d:0},{kw:"ai cybersecurity certification",vol:590,from:0,to:0,d:0},{kw:"aiops software",vol:590,from:0,to:0,d:0},{kw:"best ai security companies",vol:20,from:1,to:1,d:0},{kw:"gen ai security solutions",vol:0,from:0,to:0,d:0},{kw:"gen ai security platform",vol:0,from:0,to:0,d:0},{kw:"list of ai cybersecurity tools",vol:2400,from:23,to:0,d:-99},{kw:"aiops platforms",vol:1300,from:1,to:0,d:-99},{kw:"ai security companies",vol:720,from:1,to:0,d:-99},{kw:"ai security software",vol:590,from:14,to:0,d:-99},{kw:"ai cyber security companies",vol:170,from:1,to:0,d:-99},{kw:"ai security platfrom",vol:0,from:29,to:65,d:-36},{kw:"ai security providers",vol:20,from:1,to:11,d:-10},{kw:"ai cybersecurity software",vol:210,from:1,to:10,d:-9},{kw:"top ai cybersecurity vendors",vol:10,from:1,to:9,d:-8},{kw:"which are the top ai security companies",vol:0,from:1,to:7,d:-6},{kw:"ai cybersecurity tools",vol:2400,from:4,to:7,d:-3},{kw:"what companies provide ai security platforms",vol:0,from:6,to:7,d:-1}],
  },
  'OT Security': {
    TOFU: [{kw:"ot vulnerabilities",vol:140,from:35,to:21,d:14},{kw:"ot security tools",vol:170,from:5,to:1,d:4},{kw:"ot security standards",vol:90,from:7,to:4,d:3},{kw:"iot security",vol:5400,from:1,to:1,d:0},{kw:"ot cybersecurity",vol:1600,from:1,to:1,d:0},{kw:"operational technology cyber security",vol:390,from:1,to:1,d:0},{kw:"ot security framework",vol:70,from:1,to:1,d:0},{kw:"securing ot networks",vol:70,from:1,to:1,d:0},{kw:"cyber security for operational technology",vol:40,from:1,to:1,d:0},{kw:"ics/ot",vol:140,from:35,to:0,d:-99},{kw:"iot and ot security",vol:40,from:1,to:53,d:-52},{kw:"ot security monitoring",vol:110,from:10,to:57,d:-47},{kw:"iot/ot security",vol:70,from:1,to:12,d:-11},{kw:"manufacturing ot security",vol:50,from:1,to:2,d:-1}],
    MOFU: [{kw:"ot/ics cybersecurity",vol:70,from:54,to:16,d:38},{kw:"what is ot in cybersecurity",vol:90,from:9,to:1,d:8},{kw:"what is ot cybersecurity",vol:140,from:8,to:1,d:7},{kw:"what is operational technology",vol:720,from:4,to:1,d:3},{kw:"ot environment",vol:390,from:4,to:1,d:3},{kw:"ot networking",vol:90,from:4,to:1,d:3},{kw:"what does ot stand for in cyber security",vol:40,from:2,to:1,d:1},{kw:"ot security",vol:3600,from:1,to:1,d:0},{kw:"what is ot security",vol:1000,from:1,to:1,d:0},{kw:"operational technology security",vol:1000,from:1,to:1,d:0},{kw:"ot technology",vol:480,from:1,to:1,d:0},{kw:"ot network security",vol:390,from:1,to:1,d:0},{kw:"ot security meaning",vol:390,from:1,to:1,d:0},{kw:"ot infrastructure",vol:140,from:1,to:1,d:0},{kw:"ot cyber security framework",vol:70,from:3,to:3,d:0},{kw:"industrial ot cybersecurity",vol:70,from:0,to:0,d:0},{kw:"operational technology examples",vol:70,from:1,to:1,d:0},{kw:"operational technology networks",vol:50,from:4,to:4,d:0},{kw:"operational technology network",vol:40,from:4,to:4,d:0},{kw:"ot it security",vol:30,from:1,to:1,d:0},{kw:"operational technology definition",vol:140,from:1,to:44,d:-43},{kw:"ot network architecture",vol:90,from:15,to:56,d:-41},{kw:"ot devices",vol:390,from:1,to:5,d:-4},{kw:"ot security architecture",vol:50,from:2,to:5,d:-3}],
    BOFU: [{kw:"ot security companies",vol:210,from:13,to:1,d:12},{kw:"ot security company",vol:140,from:5,to:1,d:4},{kw:"ot security assessment",vol:90,from:6,to:5,d:1},{kw:"ot cybersecurity vendors",vol:90,from:21,to:20,d:1},{kw:"ot security solutions",vol:480,from:1,to:1,d:0},{kw:"best ot security for critical infrastructure",vol:140,from:1,to:1,d:0},{kw:"best ot security companies",vol:70,from:0,to:0,d:0},{kw:"ot cyber security companies",vol:140,from:55,to:0,d:-99}],
  },
  'Zero Trust': {
    TOFU: [{kw:"what is zero trust architecture",vol:1300,from:23,to:1,d:22},{kw:"zero trust",vol:9900,from:17,to:1,d:16},{kw:"what is zero trust networking",vol:70,from:7,to:1,d:6},{kw:"ztna security",vol:260,from:6,to:1,d:5},{kw:"zero trust network",vol:1900,from:5,to:1,d:4},{kw:"zero trust architecture",vol:6600,from:20,to:17,d:3},{kw:"zero trust security",vol:5400,from:1,to:1,d:0},{kw:"zero trust network access",vol:2900,from:1,to:1,d:0},{kw:"what is zero trust security",vol:1600,from:8,to:8,d:0},{kw:"zero trust security model",vol:1300,from:1,to:1,d:0},{kw:"zero trust access",vol:720,from:1,to:1,d:0},{kw:"what is zero trust network access",vol:720,from:1,to:1,d:0},{kw:"zero trust networking",vol:590,from:1,to:1,d:0},{kw:"zero trust edge",vol:260,from:1,to:1,d:0},{kw:"VPN vs ZTNA",vol:140,from:1,to:1,d:0},{kw:"VPN to ZTNA",vol:30,from:1,to:1,d:0},{kw:"what is zero trust",vol:2400,from:8,to:76,d:-68},{kw:"zero trust model",vol:1300,from:1,to:6,d:-5}],
    MOFU: [{kw:"How to migrate from\u00a0VPN\u00a0to\u00a0ZTNA",vol:30,from:1,to:1,d:0}],
    BOFU: [{kw:"ztna",vol:5400,from:4,to:4,d:0}],
  },
  'Quantum Security': {
    TOFU: [{kw:"QKD",vol:880,from:9,to:1,d:8},{kw:"what is QKD",vol:40,from:6,to:1,d:5},{kw:"quantum computing",vol:74000,from:0,to:0,d:0},{kw:"quantum encryption",vol:2900,from:1,to:1,d:0},{kw:"quantum key distribution",vol:1000,from:1,to:1,d:0},{kw:"HNDL",vol:1000,from:0,to:0,d:0},{kw:"quantum security",vol:880,from:1,to:1,d:0},{kw:"q-day",vol:720,from:1,to:1,d:0},{kw:"quantum day",vol:480,from:0,to:0,d:0},{kw:"quantum safe encryption",vol:390,from:1,to:1,d:0},{kw:"harvest now decrypt later",vol:210,from:0,to:0,d:0},{kw:"quantum computing security",vol:170,from:1,to:1,d:0},{kw:"NIST PQC standards",vol:70,from:0,to:0,d:0},{kw:"what is q-day",vol:30,from:1,to:1,d:0},{kw:"Shor's and Grover's Algorithms",vol:20,from:1,to:1,d:0},{kw:"what is HNDL",vol:20,from:0,to:0,d:0},{kw:"Quantum-Safe Security",vol:10,from:1,to:1,d:0},{kw:"what is quatum security",vol:0,from:1,to:1,d:0},{kw:"quantum cryptography",vol:18100,from:25,to:0,d:-99},{kw:"post-quantum cryptography",vol:8100,from:24,to:0,d:-99},{kw:"what is PQC",vol:170,from:1,to:0,d:-99},{kw:"quantum readiness",vol:110,from:23,to:0,d:-99},{kw:"Crypto-Agility",vol:70,from:1,to:0,d:-99},{kw:"quantum security solutions",vol:40,from:1,to:56,d:-55},{kw:"Cryptographic Agility",vol:140,from:1,to:19,d:-18},{kw:"PQC",vol:1900,from:4,to:18,d:-14},{kw:"post quantum readiness",vol:20,from:18,to:22,d:-4}],
    MOFU: [{kw:"Quantum-Risk Assessment",vol:20,from:1,to:2,d:-1}],
=======
// Sep 23 → Sep 30 2026 · Source: Wow_Dashboard_Data_-_9_Category.csv · flat array per funnel (d>0=gained, d<0=declined)
const WOW_MOVERS_FUNNEL: Record<string,{TOFU:{kw:string,vol:number,from:number,to:number,d:number}[],MOFU:{kw:string,vol:number,from:number,to:number,d:number}[],BOFU:{kw:string,vol:number,from:number,to:number,d:number}[]}> = {
  'Top Opportunities': {
    TOFU: [{kw:'phishing',vol:49500,from:67,to:26,d:41},{kw:'what is ddos',vol:3600,from:22,to:1,d:21},{kw:'malware definition',vol:8100,from:17,to:1,d:16},{kw:'oauth',vol:12100,from:19,to:14,d:5},{kw:'ddos meaning',vol:8100,from:6,to:1,d:5},{kw:'ethernet switching',vol:260,from:6,to:1,d:5},{kw:'iot',vol:27100,from:34,to:31,d:3},{kw:'firewalls',vol:5400,from:4,to:1,d:3},{kw:'what is ips',vol:3600,from:4,to:1,d:3},{kw:'what is malware',vol:135000,from:25,to:23,d:2},{kw:'what is phishing',vol:74000,from:9,to:7,d:2},{kw:'vpn',vol:673000,from:13,to:12,d:1},{kw:'cybersecurity',vol:201000,from:1,to:0,d:-99},{kw:'encryption',vol:22200,from:24,to:0,d:-99},{kw:'phishing email',vol:9900,from:30,to:0,d:-99},{kw:'wan',vol:33100,from:1,to:21,d:-20},{kw:'phishing definition',vol:27100,from:1,to:20,d:-19},{kw:'proxy',vol:201000,from:3,to:21,d:-18},{kw:'sd-wan',vol:6600,from:2,to:18,d:-16},{kw:'network firewall',vol:3600,from:1,to:17,d:-16},{kw:'saml',vol:18100,from:18,to:28,d:-10},{kw:'sd wan',vol:6600,from:1,to:11,d:-10},{kw:'ips',vol:49500,from:15,to:21,d:-6},{kw:'single sign on',vol:12100,from:2,to:8,d:-6},{kw:'ransomware',vol:33100,from:1,to:6,d:-5},{kw:'two factor authentication',vol:12100,from:10,to:15,d:-5},{kw:'multi factor authentication',vol:14800,from:26,to:30,d:-4},{kw:'sdwan',vol:6600,from:1,to:5,d:-4},{kw:'what is a proxy server',vol:18100,from:1,to:3,d:-2},{kw:'proxy server',vol:33100,from:3,to:4,d:-1},{kw:'internet of things',vol:22200,from:27,to:28,d:-1},{kw:'access control',vol:12100,from:2,to:3,d:-1},{kw:'encryption definition',vol:6600,from:2,to:3,d:-1},{kw:'zero day',vol:368000,from:0,to:0,d:0},{kw:'what is a firewall',vol:135000,from:3,to:3,d:0},{kw:'malware',vol:40500,from:16,to:16,d:0},{kw:'ddos',vol:33100,from:1,to:1,d:0},{kw:'iam',vol:33100,from:1,to:1,d:0},{kw:'firewall',vol:27100,from:1,to:1,d:0},{kw:'ddos attack',vol:18100,from:1,to:1,d:0},{kw:'sase',vol:14800,from:1,to:1,d:0},{kw:'what is a proxy',vol:12100,from:3,to:3,d:0},{kw:'qos',vol:9900,from:1,to:1,d:0},{kw:'byod',vol:9900,from:1,to:1,d:0},{kw:'how does vpn work',vol:4400,from:1,to:1,d:0},{kw:'802.1 x',vol:1000,from:1,to:1,d:0},{kw:'network firewalls',vol:720,from:1,to:1,d:0}],
    MOFU: [{kw:'vpn service',vol:9900,from:0,to:0,d:0}],
    BOFU: [{kw:'ethernet switch',vol:14800,from:0,to:0,d:0}],
  },
  'NAC': {
    TOFU: [{kw:'access control management',vol:720,from:60,to:20,d:40},{kw:'identity and access management system',vol:720,from:35,to:1,d:34},{kw:'iam identity access management',vol:1900,from:27,to:1,d:26},{kw:'identity access management',vol:2900,from:23,to:1,d:22},{kw:'network access control list',vol:480,from:22,to:1,d:21},{kw:'what is identity and access management',vol:590,from:20,to:1,d:19},{kw:'what is iam',vol:1900,from:9,to:1,d:8},{kw:'network access control solutions',vol:1000,from:7,to:1,d:6},{kw:'what is access control',vol:1000,from:6,to:1,d:5},{kw:'types of access control list',vol:50,from:12,to:7,d:5},{kw:'access control definition',vol:320,from:4,to:1,d:3},{kw:'network access control software',vol:320,from:5,to:2,d:3},{kw:'nac computer',vol:20,from:4,to:1,d:3},{kw:'nac network',vol:1300,from:3,to:1,d:2},{kw:'nac cyber security',vol:390,from:3,to:1,d:2},{kw:'nac security',vol:210,from:3,to:1,d:2},{kw:'nac network access',vol:210,from:3,to:1,d:2},{kw:'what is iam security',vol:50,from:3,to:1,d:2},{kw:'acl network',vol:720,from:2,to:1,d:1},{kw:'network access control benefits',vol:50,from:2,to:1,d:1},{kw:'access control meaning',vol:260,from:3,to:20,d:-17},{kw:'iot device security',vol:1000,from:1,to:7,d:-6},{kw:'access control list example',vol:140,from:1,to:7,d:-6},{kw:'access control services',vol:720,from:1,to:4,d:-3},{kw:'security for iot devices',vol:70,from:1,to:4,d:-3},{kw:'acls security',vol:110,from:1,to:3,d:-2},{kw:'nac server',vol:20,from:1,to:3,d:-2},{kw:'access control',vol:12100,from:2,to:3,d:-1},{kw:'network access control policy',vol:40,from:1,to:2,d:-1},{kw:'nac security solution',vol:30,from:1,to:2,d:-1},{kw:'byod',vol:9900,from:1,to:1,d:0},{kw:'iot security',vol:3600,from:1,to:1,d:0},{kw:'network access control',vol:2900,from:1,to:1,d:0},{kw:'bring your own device',vol:2400,from:0,to:0,d:0},{kw:'access control security',vol:1300,from:9,to:9,d:0},{kw:'internet of things security',vol:880,from:1,to:1,d:0},{kw:'what is iot security',vol:880,from:1,to:1,d:0},{kw:'access control lists',vol:720,from:1,to:1,d:0},{kw:'bring your own device policy',vol:720,from:1,to:1,d:0},{kw:'what is network access control',vol:390,from:1,to:1,d:0},{kw:'what is nac in networking',vol:390,from:1,to:1,d:0},{kw:'iot network security',vol:320,from:1,to:1,d:0},{kw:'iot network security',vol:320,from:1,to:1,d:0},{kw:'iam definition',vol:260,from:3,to:3,d:0},{kw:'access control methods',vol:260,from:5,to:5,d:0},{kw:'what is an acl networking',vol:210,from:1,to:1,d:0},{kw:'acls networking',vol:210,from:2,to:2,d:0},{kw:'network access control system',vol:210,from:1,to:1,d:0},{kw:'how to secure iot devices',vol:170,from:5,to:5,d:0},{kw:'access control list in networking',vol:140,from:1,to:1,d:0},{kw:'nac network security',vol:140,from:3,to:3,d:0},{kw:'acl firewall',vol:110,from:1,to:1,d:0},{kw:'nac network access control',vol:110,from:1,to:1,d:0},{kw:'access control examples',vol:110,from:1,to:1,d:0},{kw:'nac it',vol:110,from:1,to:1,d:0},{kw:'nac technology',vol:110,from:1,to:1,d:0},{kw:'networking acl',vol:90,from:1,to:1,d:0},{kw:'access control in network security',vol:90,from:4,to:4,d:0},{kw:'nac tools',vol:50,from:1,to:1,d:0},{kw:'network access control device',vol:50,from:1,to:1,d:0},{kw:'cyber security in iot devices',vol:50,from:1,to:1,d:0},{kw:'benefits of access control list',vol:40,from:1,to:1,d:0},{kw:'what is nac security',vol:30,from:1,to:1,d:0},{kw:'security on iot devices',vol:30,from:1,to:1,d:0},{kw:'cyber security iot devices',vol:30,from:1,to:1,d:0},{kw:'network access control methods',vol:20,from:2,to:2,d:0},{kw:'network access control technologies',vol:20,from:1,to:1,d:0},{kw:'access control methods in computer networks',vol:20,from:4,to:4,d:0},{kw:'nac computer security',vol:20,from:1,to:1,d:0},{kw:'how to secure iot network',vol:20,from:1,to:1,d:0},{kw:'acl access control lists',vol:10,from:1,to:1,d:0}],
    MOFU: [{kw:'access control technologies',vol:880,from:0,to:0,d:0}],
    BOFU: [{kw:'iot firewall',vol:70,from:21,to:4,d:17},{kw:'nac solutions',vol:390,from:1,to:8,d:-7},{kw:'network access control products',vol:40,from:1,to:4,d:-3},{kw:'nac network access control products',vol:20,from:1,to:3,d:-2},{kw:'access control solutions',vol:1900,from:0,to:0,d:0},{kw:'iot security solutions',vol:1000,from:1,to:1,d:0},{kw:'access control devices',vol:590,from:0,to:0,d:0},{kw:'nac service',vol:40,from:0,to:0,d:0}],
  },
  'NGFW': {
    TOFU: [{kw:'difference between next generation firewall and standard firewall',vol:30,from:21,to:1,d:20},{kw:'network based firewall',vol:390,from:19,to:6,d:13},{kw:'ngfw networking',vol:30,from:9,to:1,d:8},{kw:'layer 7 firewall',vol:390,from:37,to:30,d:7},{kw:'hardware firewall',vol:4400,from:5,to:1,d:4},{kw:'physical firewall',vol:260,from:5,to:1,d:4},{kw:'secure web gateway vs next generation firewall',vol:30,from:15,to:11,d:4},{kw:'firewalls',vol:5400,from:4,to:1,d:3},{kw:'next generation firewall vs waf',vol:70,from:4,to:1,d:3},{kw:'firewall settings',vol:1900,from:3,to:1,d:2},{kw:'benefits of firewall security',vol:50,from:3,to:1,d:2},{kw:'web application firewall',vol:9900,from:1,to:23,d:-22},{kw:'waf firewall',vol:480,from:1,to:21,d:-20},{kw:'network firewall',vol:3600,from:1,to:17,d:-16},{kw:'ngfw network',vol:30,from:1,to:11,d:-10},{kw:'next generation firewalls ngfw',vol:20,from:1,to:10,d:-9},{kw:'ngfw layer 7 firewall',vol:30,from:1,to:5,d:-4},{kw:'hardware vs software firewall',vol:170,from:1,to:4,d:-3},{kw:'hardware firewall vs software firewall',vol:140,from:1,to:4,d:-3},{kw:'software firewall vs hardware firewall',vol:70,from:1,to:4,d:-3},{kw:'utm firewall',vol:590,from:1,to:2,d:-1},{kw:'firewalls explained',vol:480,from:1,to:2,d:-1},{kw:'cloud firewall service',vol:210,from:1,to:2,d:-1},{kw:'what is proxy firewall',vol:70,from:1,to:2,d:-1},{kw:'enterprise security firewall',vol:50,from:1,to:2,d:-1},{kw:'advantages of hardware firewall',vol:30,from:1,to:2,d:-1},{kw:'what is a firewall',vol:135000,from:3,to:3,d:0},{kw:'firewall',vol:27100,from:1,to:1,d:0},{kw:'firewall configuration',vol:5400,from:1,to:1,d:0},{kw:'network firewall security',vol:4400,from:1,to:1,d:0},{kw:'network security firewall',vol:2400,from:1,to:1,d:0},{kw:'network security firewall',vol:2400,from:1,to:1,d:0},{kw:'what does a firewall do',vol:1600,from:1,to:1,d:0},{kw:'stateful firewall',vol:1300,from:1,to:1,d:0},{kw:'what is waf',vol:1300,from:1,to:1,d:0},{kw:'waf security',vol:1300,from:1,to:1,d:0},{kw:'waf meaning',vol:1000,from:1,to:1,d:0},{kw:'stateful vs stateless firewall',vol:1000,from:1,to:1,d:0},{kw:'stateful inspection firewall',vol:1000,from:3,to:3,d:0},{kw:'firewall as a service',vol:1000,from:1,to:1,d:0},{kw:'network firewalls',vol:720,from:1,to:1,d:0},{kw:'types of firewall',vol:720,from:8,to:8,d:0},{kw:'stateless vs stateful firewall',vol:720,from:1,to:1,d:0},{kw:'how does a firewall work',vol:590,from:1,to:1,d:0},{kw:'proxy firewall',vol:590,from:1,to:1,d:0},{kw:'stateful firewall vs stateless firewall',vol:590,from:1,to:1,d:0},{kw:'security firewall',vol:390,from:1,to:1,d:0},{kw:'security firewall',vol:390,from:1,to:1,d:0},{kw:'next generation firewall ngfw',vol:390,from:1,to:1,d:0},{kw:'stateless firewall',vol:320,from:2,to:2,d:0},{kw:'what is a network firewall',vol:320,from:1,to:1,d:0},{kw:'waf vs firewall',vol:320,from:1,to:1,d:0},{kw:'what is firewall in networking',vol:260,from:1,to:1,d:0},{kw:'what is a stateful firewall',vol:260,from:1,to:1,d:0},{kw:'how firewall works',vol:210,from:1,to:1,d:0},{kw:'firewall as a service providers',vol:210,from:1,to:1,d:0},{kw:'perimeter firewall',vol:210,from:1,to:1,d:0},{kw:'what is next generation firewall',vol:170,from:1,to:1,d:0},{kw:'firewall setup',vol:170,from:1,to:1,d:0},{kw:'how to setup a firewall',vol:140,from:1,to:1,d:0},{kw:'proxy server firewall',vol:140,from:1,to:1,d:0},{kw:'benefits of firewall',vol:140,from:1,to:1,d:0},{kw:'utm vs firewall',vol:110,from:1,to:1,d:0},{kw:'how firewalls work',vol:90,from:1,to:1,d:0},{kw:'firewall vs waf',vol:90,from:1,to:1,d:0},{kw:'next generation firewall vs utm',vol:90,from:1,to:1,d:0},{kw:'distributed firewall',vol:70,from:1,to:1,d:0},{kw:'what are software firewalls',vol:70,from:1,to:1,d:0},{kw:'what is utm firewall',vol:50,from:1,to:1,d:0},{kw:'firewall vs utm',vol:50,from:1,to:1,d:0},{kw:'border firewall',vol:50,from:1,to:1,d:0},{kw:'firewall defined',vol:40,from:2,to:2,d:0},{kw:'configuration of firewall',vol:40,from:1,to:1,d:0},{kw:'what is next generation firewalls',vol:40,from:1,to:1,d:0},{kw:'how network firewall works',vol:40,from:1,to:1,d:0},{kw:'ngfw definition',vol:40,from:8,to:8,d:0},{kw:'how network firewall is different from application firewall',vol:40,from:1,to:1,d:0},{kw:'application firewall and network firewall',vol:40,from:1,to:1,d:0},{kw:'application proxy firewall',vol:30,from:1,to:1,d:0},{kw:'working of firewall',vol:30,from:1,to:1,d:0},{kw:'how hardware firewall works',vol:30,from:1,to:1,d:0},{kw:'what is the next generation firewall',vol:30,from:1,to:1,d:0},{kw:'what is next generation firewall ngfw',vol:30,from:1,to:1,d:0},{kw:'ngfw vs ips',vol:30,from:1,to:1,d:0},{kw:'firewall utm ngfw',vol:30,from:1,to:1,d:0},{kw:'next generation firewall meaning',vol:30,from:1,to:1,d:0},{kw:'5th generation firewall',vol:30,from:5,to:5,d:0},{kw:'transparent firewalls',vol:20,from:1,to:1,d:0},{kw:'layer 2 firewall',vol:20,from:1,to:1,d:0},{kw:'network firewall definition',vol:20,from:1,to:1,d:0},{kw:'how firewall works in network',vol:20,from:1,to:1,d:0},{kw:'transparent mode firewall',vol:20,from:1,to:1,d:0},{kw:'firewall transparent mode',vol:20,from:1,to:1,d:0},{kw:'difference between application level firewall and network level firewall',vol:20,from:1,to:1,d:0}],
    MOFU: [{kw:'next generation firewall security',vol:40,from:7,to:5,d:2},{kw:'what is enterprise firewall',vol:30,from:1,to:9,d:-8},{kw:'advantages to next generation firewalls',vol:30,from:1,to:8,d:-7},{kw:'ngfw tools',vol:20,from:1,to:7,d:-6},{kw:'next generation firewall features list',vol:30,from:1,to:6,d:-5},{kw:'ngfw firewall features',vol:20,from:1,to:6,d:-5},{kw:'next gen firewall services',vol:70,from:1,to:4,d:-3},{kw:'features of next generation firewall',vol:70,from:1,to:4,d:-3},{kw:'next generation firewall benefits',vol:50,from:1,to:4,d:-3},{kw:'next generation firewall software',vol:30,from:1,to:3,d:-2},{kw:'branch office firewall',vol:20,from:1,to:3,d:-2},{kw:'next gen firewall magic quadrant',vol:40,from:1,to:1,d:0},{kw:'ngfw throughput',vol:30,from:1,to:1,d:0},{kw:'next generation enterprise firewall',vol:30,from:1,to:1,d:0},{kw:'enterprise firewall magic quadrant',vol:30,from:1,to:1,d:0},{kw:'advantages to next generation firewall',vol:30,from:1,to:1,d:0},{kw:'ngfw magic quadrant',vol:20,from:1,to:1,d:0}],
    BOFU: [{kw:'layer 3 firewall',vol:70,from:0,to:32,d:99},{kw:'enterprise firewall router',vol:40,from:19,to:1,d:18},{kw:'enterprise firewall',vol:320,from:28,to:14,d:14},{kw:'ngfw',vol:4400,from:3,to:1,d:2},{kw:'add a next generation firewall',vol:20,from:3,to:1,d:2},{kw:'small business firewall',vol:720,from:2,to:1,d:1},{kw:'network firewall price',vol:90,from:2,to:1,d:1},{kw:'next generation application firewall',vol:30,from:3,to:2,d:1},{kw:'firewall security price in usa',vol:20,from:2,to:1,d:1},{kw:'low cost firewall',vol:20,from:4,to:3,d:1},{kw:'enterprise grade firewall',vol:30,from:14,to:33,d:-19},{kw:'next generation firewall',vol:2400,from:1,to:4,d:-3},{kw:'next gen firewall',vol:2400,from:1,to:4,d:-3},{kw:'firewall next generation',vol:720,from:1,to:4,d:-3},{kw:'nexgen firewall',vol:30,from:1,to:2,d:-1},{kw:'ngfw products',vol:30,from:1,to:2,d:-1},{kw:'cheap firewall',vol:20,from:13,to:14,d:-1},{kw:'how much is a network firewall',vol:20,from:1,to:2,d:-1},{kw:'business firewall',vol:320,from:2,to:2,d:0},{kw:'firewall price',vol:170,from:1,to:1,d:0},{kw:'firewall cost',vol:90,from:1,to:1,d:0},{kw:'next generation firewall appliance',vol:90,from:1,to:1,d:0},{kw:'network firewall security price',vol:70,from:1,to:1,d:0},{kw:'network firewall cost',vol:70,from:1,to:1,d:0},{kw:'business firewall solutions',vol:50,from:1,to:1,d:0},{kw:'firewall security price',vol:30,from:1,to:1,d:0},{kw:'firewall price comparison',vol:30,from:1,to:1,d:0},{kw:'affordable firewall',vol:20,from:13,to:13,d:0},{kw:'price of hardware firewall',vol:20,from:1,to:1,d:0},{kw:'physical firewall prices',vol:10,from:1,to:1,d:0}],
  },
  'SD-WAN': {
    TOFU: [{kw:'sd wan providers',vol:590,from:0,to:12,d:99},{kw:'sd wan appliance',vol:210,from:37,to:8,d:29},{kw:'sd wan access',vol:30,from:6,to:1,d:5},{kw:'sd wan software',vol:140,from:4,to:1,d:3},{kw:'sd wan security concerns',vol:50,from:4,to:1,d:3},{kw:'what is sd wan and how does it work',vol:30,from:4,to:1,d:3},{kw:'sdn wan',vol:260,from:3,to:1,d:2},{kw:'sd wan requirements',vol:90,from:6,to:4,d:2},{kw:'mpls to sd wan',vol:90,from:3,to:1,d:2},{kw:'wan sd wan',vol:40,from:3,to:1,d:2},{kw:'sd wan brands',vol:30,from:16,to:14,d:2},{kw:'difference between sd wan and wan',vol:30,from:9,to:7,d:2},{kw:'wan sdn',vol:20,from:3,to:1,d:2},{kw:'wan cost',vol:50,from:33,to:32,d:1},{kw:'sd wan vs vpls',vol:30,from:3,to:2,d:1},{kw:'sd wan vs firewall',vol:30,from:5,to:4,d:1},{kw:'sdn sd wan',vol:20,from:2,to:1,d:1},{kw:'managed service sd wan',vol:210,from:6,to:0,d:-99},{kw:'wan',vol:33100,from:1,to:21,d:-20},{kw:'mpls vs hybrid wan',vol:40,from:1,to:20,d:-19},{kw:'sd wan lte',vol:70,from:1,to:19,d:-18},{kw:'sd wan ready',vol:20,from:1,to:18,d:-17},{kw:'sd-wan',vol:6600,from:2,to:18,d:-16},{kw:'sd wan data center',vol:30,from:1,to:14,d:-13},{kw:'sd wan lan',vol:30,from:1,to:12,d:-11},{kw:'sd wan',vol:6600,from:1,to:11,d:-10},{kw:'sd wan price list',vol:20,from:1,to:11,d:-10},{kw:'sd wan comparison',vol:110,from:1,to:10,d:-9},{kw:'what is wan',vol:2900,from:1,to:8,d:-7},{kw:'sd wan pricing',vol:170,from:1,to:8,d:-7},{kw:'sd wan as a service pricing',vol:30,from:3,to:9,d:-6},{kw:'sd wan security features',vol:110,from:1,to:6,d:-5},{kw:'sd wan pricing model',vol:40,from:1,to:6,d:-5},{kw:'sd wan security issues',vol:40,from:1,to:6,d:-5},{kw:'sdwan',vol:6600,from:1,to:5,d:-4},{kw:'sd wan cost',vol:210,from:1,to:5,d:-4},{kw:'sd wan for enterprise',vol:50,from:1,to:5,d:-4},{kw:'sd wan explained',vol:720,from:1,to:4,d:-3},{kw:'sd wan device',vol:210,from:1,to:4,d:-3},{kw:'sd wan cost calculator',vol:20,from:1,to:4,d:-3},{kw:'sd wan software defined wan',vol:20,from:1,to:4,d:-3},{kw:'software defined wan',vol:1600,from:1,to:3,d:-2},{kw:'software defined wide area network',vol:260,from:1,to:3,d:-2},{kw:'sd wan cost savings',vol:70,from:1,to:3,d:-2},{kw:'what does sd wan mean',vol:50,from:1,to:3,d:-2},{kw:'managed sd wan',vol:1000,from:1,to:2,d:-1},{kw:'what is managed sd wan',vol:140,from:1,to:2,d:-1},{kw:'sdn in the wan',vol:140,from:1,to:2,d:-1},{kw:'is sd wan better than mpls',vol:90,from:1,to:2,d:-1},{kw:'sd wan capabilities',vol:40,from:1,to:2,d:-1},{kw:'difference between wan and sd wan',vol:30,from:7,to:8,d:-1},{kw:'wan definition',vol:6600,from:1,to:1,d:0},{kw:'wide area network',vol:2900,from:1,to:1,d:0},{kw:'what is sd-wan',vol:2400,from:1,to:1,d:0},{kw:'what is sd wan',vol:1900,from:1,to:1,d:0},{kw:'sd wan solutions',vol:1600,from:1,to:1,d:0},{kw:'sd wan meaning',vol:1300,from:1,to:1,d:0},{kw:'sd wan vs mpls',vol:880,from:1,to:1,d:0},{kw:'sd wan managed services',vol:880,from:0,to:0,d:0},{kw:'sd wan benefits',vol:480,from:1,to:1,d:0},{kw:'managed sd wan solutions',vol:480,from:0,to:0,d:0},{kw:'sd wan definition',vol:390,from:1,to:1,d:0},{kw:'sd wan technology',vol:390,from:1,to:1,d:0},{kw:'benefits of sd wan',vol:260,from:1,to:1,d:0},{kw:'wan aggregation',vol:260,from:1,to:1,d:0},{kw:'sd wan router',vol:260,from:0,to:0,d:0},{kw:'sd wan over mpls',vol:170,from:1,to:1,d:0},{kw:'sd wan explanation',vol:110,from:1,to:1,d:0},{kw:'wan providers',vol:110,from:0,to:0,d:0},{kw:'what is wan aggregation',vol:110,from:1,to:1,d:0},{kw:'wan security issues',vol:90,from:1,to:1,d:0},{kw:'sd wan vs mpls cost comparison',vol:90,from:1,to:1,d:0},{kw:'sd wan with mpls',vol:90,from:3,to:3,d:0},{kw:'sd wan overview',vol:70,from:1,to:1,d:0},{kw:'define sd wan',vol:70,from:1,to:1,d:0},{kw:'diy vs managed sd wan',vol:70,from:1,to:1,d:0},{kw:'sd wan appliances',vol:50,from:0,to:0,d:0},{kw:'definition sd wan',vol:50,from:1,to:1,d:0},{kw:'diy sd wan',vol:50,from:1,to:1,d:0},{kw:'difference between sdn and sd wan',vol:50,from:1,to:1,d:0},{kw:'why is sd wan important',vol:50,from:1,to:1,d:0},{kw:'sdwan explained',vol:40,from:1,to:1,d:0},{kw:'sd wan replace mpls',vol:40,from:1,to:1,d:0},{kw:'sd wan vs. mpls',vol:30,from:1,to:1,d:0},{kw:'whats sd wan',vol:30,from:1,to:1,d:0},{kw:'sd wan connectivity',vol:30,from:1,to:1,d:0},{kw:'sd wan what is it',vol:30,from:1,to:1,d:0},{kw:'sd wan price comparison',vol:30,from:9,to:9,d:0},{kw:'why use sd wan',vol:30,from:1,to:1,d:0},{kw:'sd wan concept',vol:30,from:1,to:1,d:0},{kw:'sdn wan vs mpls',vol:30,from:1,to:1,d:0},{kw:'sd wan software defined wide area network',vol:30,from:3,to:3,d:0},{kw:'sd wan aggregation',vol:30,from:1,to:1,d:0},{kw:'what is the difference between wan and mpls',vol:30,from:1,to:1,d:0},{kw:'sdn wan solutions',vol:20,from:1,to:1,d:0},{kw:'sd-wan aggregation',vol:20,from:1,to:1,d:0},{kw:'sd wan enterprise edition',vol:20,from:1,to:1,d:0},{kw:'sd wan features comparison',vol:20,from:1,to:1,d:0}],
    MOFU: [{kw:'sd wan vendors',vol:390,from:0,to:24,d:99},{kw:'sd wan application performance',vol:70,from:14,to:1,d:13},{kw:'sd wan fec',vol:20,from:8,to:7,d:1},{kw:'fully managed sd wan',vol:320,from:30,to:0,d:-99},{kw:'sd wan automation',vol:70,from:42,to:0,d:-99},{kw:'cloud managed sd wan',vol:110,from:3,to:27,d:-24},{kw:'sd wan visibility',vol:70,from:78,to:92,d:-14},{kw:'wan security measures',vol:70,from:1,to:4,d:-3},{kw:'wan security risks',vol:70,from:1,to:3,d:-2},{kw:'sd wan solutions with dynamic routing',vol:30,from:1,to:3,d:-2},{kw:'cloud sd wan',vol:140,from:3,to:4,d:-1},{kw:'sd wan bandwidth',vol:40,from:4,to:5,d:-1},{kw:'sd wan security measure',vol:20,from:4,to:5,d:-1},{kw:'sd wan security',vol:720,from:1,to:1,d:0},{kw:'sd wan advantages',vol:210,from:1,to:1,d:0},{kw:'business sd wan',vol:140,from:0,to:0,d:0},{kw:'sd wan leaders',vol:90,from:1,to:1,d:0},{kw:'best sd wan providers',vol:90,from:0,to:0,d:0},{kw:'best sd wan vendors',vol:90,from:0,to:0,d:0},{kw:'advantages of sd wan',vol:70,from:1,to:1,d:0},{kw:'leading sd wan vendors',vol:50,from:0,to:0,d:0},{kw:'sd wan security measures',vol:10,from:6,to:6,d:0}],
    BOFU: [{kw:'sd wan vendors comparison',vol:90,from:0,to:24,d:99},{kw:'small business wan',vol:30,from:4,to:2,d:2},{kw:'sd wan multi cloud',vol:30,from:1,to:3,d:-2},{kw:'sd wan companies',vol:210,from:0,to:0,d:0},{kw:'sd wan for small business',vol:170,from:1,to:1,d:0},{kw:'top sd wan providers',vol:110,from:0,to:0,d:0},{kw:'best sd wan',vol:90,from:0,to:0,d:0},{kw:'top sd wan vendors',vol:70,from:0,to:0,d:0},{kw:'sd wan hardware vendors',vol:30,from:0,to:0,d:0},{kw:'sd wan and cloud',vol:20,from:8,to:8,d:0}],
  },
  'SASE': {
    TOFU: [{kw:'Sase Providers',vol:480,from:13,to:1,d:12},{kw:'Sase Provider',vol:320,from:6,to:1,d:5},{kw:'Sse',vol:14800,from:1,to:0,d:-99},{kw:'What Is Sse',vol:1900,from:1,to:0,d:-99},{kw:'Sase Benefits',vol:720,from:1,to:4,d:-3},{kw:'Sase',vol:14800,from:1,to:1,d:0},{kw:'Sase Meaning',vol:4400,from:1,to:1,d:0},{kw:'What Is Sase',vol:3600,from:1,to:1,d:0},{kw:'Secure Access Service Edge',vol:2900,from:1,to:1,d:0},{kw:'Sase Solutions',vol:1900,from:1,to:1,d:0},{kw:'Security Service Edge',vol:1600,from:1,to:1,d:0},{kw:'Sase Architecture',vol:1300,from:1,to:1,d:0},{kw:'Sase Definition',vol:1000,from:1,to:1,d:0},{kw:'Sase Vs Sse',vol:1000,from:1,to:1,d:0},{kw:'Secure Access Service Edge SASE',vol:480,from:1,to:1,d:0},{kw:'Sase Platform',vol:480,from:1,to:1,d:0},{kw:'Sase Vs Casb',vol:390,from:1,to:1,d:0},{kw:'Sase Services',vol:390,from:1,to:1,d:0},{kw:'Sase Network',vol:320,from:1,to:1,d:0},{kw:'Sase Vendor',vol:320,from:1,to:1,d:0},{kw:'Sase Network Security',vol:260,from:1,to:1,d:0},{kw:'Sase Vs Ztna',vol:170,from:1,to:1,d:0},{kw:'Sase Vs Vpn',vol:170,from:1,to:1,d:0},{kw:'Sd-Wan Vs Sase',vol:90,from:1,to:1,d:0},{kw:'How Does Sase Work',vol:50,from:1,to:1,d:0},{kw:'Sase Service Provider',vol:30,from:1,to:1,d:0}],
    MOFU: [{kw:'Sovereign Sase',vol:40,from:1,to:2,d:-1},{kw:'Ai Sase',vol:40,from:8,to:8,d:0}],
    BOFU: [{kw:'Ai Powered Sase',vol:30,from:6,to:11,d:-5},{kw:'Single Vendor Sase',vol:170,from:1,to:3,d:-2}],
  },
  'AI Cybersecurity': {
    TOFU: [{kw:'agentic ai security',vol:1000,from:0,to:22,d:99},{kw:'what are ai data centers',vol:1000,from:0,to:11,d:99},{kw:'Generative ai security',vol:720,from:0,to:49,d:99},{kw:'ai prompt injection',vol:590,from:0,to:1,d:99},{kw:'ai data center',vol:5400,from:53,to:1,d:52},{kw:'ai red teaming',vol:880,from:39,to:1,d:38},{kw:'aiops meaning',vol:140,from:13,to:1,d:12},{kw:'aiops definition',vol:140,from:35,to:24,d:11},{kw:'what does deepfake mean',vol:720,from:11,to:1,d:10},{kw:'how do deepfakes work',vol:720,from:31,to:22,d:9},{kw:'ai security threats',vol:320,from:14,to:5,d:9},{kw:'ai cybersecurity risks',vol:1600,from:22,to:19,d:3},{kw:'what is ai security',vol:720,from:4,to:1,d:3},{kw:'how can generative ai be used in cybersecurity',vol:880,from:10,to:8,d:2},{kw:'what is deepfake ai',vol:70,from:3,to:1,d:2},{kw:'what is an ai data center',vol:2400,from:27,to:0,d:-99},{kw:'what is aiops',vol:1900,from:12,to:0,d:-99},{kw:'artificial intelligence data center',vol:480,from:26,to:0,d:-99},{kw:'what does aiops stand for',vol:50,from:1,to:0,d:-99},{kw:'aiops',vol:5400,from:1,to:25,d:-24},{kw:'deepfake ai',vol:5400,from:5,to:21,d:-16},{kw:'what are aiops',vol:50,from:1,to:17,d:-16},{kw:'deepfakes meaning',vol:1000,from:1,to:16,d:-15},{kw:'ai deepfakes',vol:2400,from:1,to:9,d:-8},{kw:'risks of ai in cybersecurity',vol:110,from:39,to:43,d:-4},{kw:'ai security risk',vol:320,from:1,to:4,d:-3},{kw:'ai cybersecurity threats',vol:480,from:12,to:14,d:-2},{kw:'deepfake ai examples',vol:0,from:15,to:17,d:-2},{kw:'ai cybersecurity',vol:4400,from:2,to:3,d:-1},{kw:'AI in cybersecurity',vol:22200,from:1,to:1,d:0},{kw:'ai governance',vol:8100,from:0,to:0,d:0},{kw:'AI security',vol:6600,from:16,to:16,d:0},{kw:'frontier ai',vol:3600,from:0,to:0,d:0},{kw:'ai governance framework',vol:2900,from:0,to:0,d:0},{kw:'ai adoption',vol:2400,from:1,to:1,d:0},{kw:'cybersecurity and ai',vol:1000,from:1,to:1,d:0},{kw:'ai security definition',vol:720,from:4,to:4,d:0},{kw:'Artificial intelligence in cybersecurity',vol:390,from:1,to:1,d:0},{kw:'role of ai in cybersecurity',vol:260,from:1,to:1,d:0},{kw:'ai adoption by industry',vol:260,from:0,to:0,d:0},{kw:'ai adoption statistics',vol:260,from:0,to:0,d:0},{kw:'ai cybersecurity incidents',vol:140,from:2,to:2,d:0},{kw:'artificial intelligence risk management',vol:140,from:0,to:0,d:0},{kw:'ai adoption rate',vol:140,from:0,to:0,d:0},{kw:'what is ai adoption',vol:90,from:1,to:1,d:0},{kw:'what is ai risk management',vol:50,from:0,to:0,d:0},{kw:'ai security examples',vol:40,from:1,to:1,d:0},{kw:'what is ai in cybersecurity',vol:20,from:1,to:1,d:0},{kw:'how ai security works',vol:0,from:1,to:1,d:0},{kw:'what industries benefit most from ai adoption',vol:0,from:0,to:0,d:0},{kw:'what frameworks guide successful ai adoption',vol:0,from:0,to:0,d:0}],
    MOFU: [{kw:'ai security frameworks',vol:140,from:0,to:16,d:99},{kw:'ai security for enterprise',vol:20,from:0,to:9,d:99},{kw:'aiops capabilities',vol:90,from:36,to:1,d:35},{kw:'artificial intelligence for it operations',vol:390,from:20,to:1,d:19},{kw:'generative ai adoption',vol:210,from:21,to:9,d:12},{kw:'ai driven security',vol:210,from:17,to:7,d:10},{kw:'ai secops',vol:110,from:7,to:1,d:6},{kw:'ai adoption framework',vol:1000,from:24,to:20,d:4},{kw:'deepfake attacks',vol:90,from:4,to:1,d:3},{kw:'ai automation in cybersecurity',vol:50,from:7,to:5,d:2},{kw:'ai security use case',vol:0,from:25,to:23,d:2},{kw:'ai data center architecture',vol:110,from:14,to:13,d:1},{kw:'ai security benefits',vol:20,from:2,to:1,d:1},{kw:'aiops monitoring',vol:140,from:50,to:0,d:-99},{kw:'ai based security system',vol:90,from:1,to:0,d:-99},{kw:'aiops framework',vol:90,from:1,to:9,d:-8},{kw:'artificial intelligence security',vol:720,from:7,to:13,d:-6},{kw:'ai for cybersecurity',vol:880,from:1,to:6,d:-5},{kw:'ai security systems',vol:390,from:1,to:5,d:-4},{kw:'adoption of ai for cybersecurity',vol:70,from:7,to:10,d:-3},{kw:'ai powered cybersecurity',vol:210,from:1,to:2,d:-1},{kw:'ai based security',vol:70,from:6,to:7,d:-1},{kw:'deepfake ai risks',vol:0,from:3,to:4,d:-1},{kw:'ai in risk management',vol:3600,from:0,to:0,d:0},{kw:'ai risk management',vol:3600,from:0,to:0,d:0},{kw:'ai risk management framework',vol:1300,from:0,to:0,d:0},{kw:'ai risk assessment',vol:1300,from:0,to:0,d:0},{kw:'ai operations',vol:880,from:0,to:0,d:0},{kw:'enterprise ai adoption',vol:720,from:0,to:0,d:0},{kw:'ai adoption challenges',vol:720,from:0,to:0,d:0},{kw:'generative ai in cybersecurity',vol:480,from:13,to:13,d:0},{kw:'ai adoption strategy',vol:480,from:1,to:1,d:0},{kw:'ai siem',vol:390,from:0,to:0,d:0},{kw:'ai security best practices',vol:390,from:0,to:0,d:0},{kw:'artificial intelligence risk management framework',vol:320,from:0,to:0,d:0},{kw:'ai security monitoring',vol:260,from:8,to:8,d:0},{kw:'ai and risk management',vol:260,from:0,to:0,d:0},{kw:'ai for risk management',vol:260,from:0,to:0,d:0},{kw:'preparing for ai adoption',vol:210,from:1,to:1,d:0},{kw:'generative ai for cybersecurity',vol:170,from:0,to:0,d:0},{kw:'strategic ai adoption',vol:170,from:1,to:1,d:0},{kw:'ai adoption in healthcare',vol:170,from:0,to:0,d:0},{kw:'ai powered security',vol:110,from:3,to:3,d:0},{kw:'enterprise aiops',vol:110,from:1,to:1,d:0},{kw:'ai model risk management',vol:90,from:0,to:0,d:0},{kw:'enterprise ai adoption trends',vol:90,from:0,to:0,d:0},{kw:'ai impact on data centers',vol:70,from:0,to:0,d:0},{kw:'aiops trends',vol:70,from:0,to:0,d:0},{kw:'aiops network',vol:70,from:11,to:11,d:0},{kw:'ai adoption in financial services',vol:70,from:0,to:0,d:0},{kw:'aiops networking',vol:50,from:7,to:7,d:0},{kw:'enterprise ai adoption challenges',vol:50,from:0,to:0,d:0},{kw:'ai security challenges',vol:40,from:1,to:1,d:0},{kw:'benefits of ai data center',vol:40,from:15,to:15,d:0},{kw:'ai and machine learning for risk management',vol:40,from:0,to:0,d:0},{kw:'ai data center trends',vol:30,from:0,to:0,d:0},{kw:'deepfake ai technology',vol:20,from:1,to:1,d:0},{kw:'ai cybersecurity applications',vol:0,from:1,to:1,d:0},{kw:'data center challenges in ai',vol:0,from:0,to:0,d:0},{kw:'deepfake ai best practices',vol:0,from:0,to:0,d:0},{kw:'deepfake ai challenges',vol:0,from:0,to:0,d:0}],
    BOFU: [{kw:'aiops tools',vol:1900,from:0,to:31,d:99},{kw:'aiops platforms',vol:1300,from:0,to:1,d:99},{kw:'ai security solutions',vol:1600,from:17,to:9,d:8},{kw:'which are the top ai security companies',vol:0,from:6,to:1,d:5},{kw:'ai security platfrom',vol:0,from:33,to:29,d:4},{kw:'ai cybersecurity providers',vol:10,from:19,to:18,d:1},{kw:'aiops software',vol:590,from:13,to:0,d:-99},{kw:'ai security vendor',vol:0,from:1,to:0,d:-99},{kw:'ai security services',vol:90,from:1,to:6,d:-5},{kw:'what companies provide ai security platforms',vol:0,from:1,to:6,d:-5},{kw:'ai cybersecurity tools',vol:2400,from:1,to:4,d:-3},{kw:'list of ai cybersecurity tools',vol:2400,from:21,to:23,d:-2},{kw:'ai cybersecurity solutions',vol:880,from:1,to:1,d:0},{kw:'ai security companies',vol:720,from:1,to:1,d:0},{kw:'ai cybersecurity certification',vol:590,from:0,to:0,d:0},{kw:'ai security software',vol:590,from:14,to:14,d:0},{kw:'ai cybersecurity software',vol:210,from:1,to:1,d:0},{kw:'aiops vendors',vol:210,from:0,to:0,d:0},{kw:'ai cyber security companies',vol:170,from:1,to:1,d:0},{kw:'best ai security companies',vol:20,from:1,to:1,d:0},{kw:'ai security providers',vol:20,from:1,to:1,d:0},{kw:'top ai cybersecurity vendors',vol:10,from:1,to:1,d:0},{kw:'gen ai security solutions',vol:0,from:0,to:0,d:0},{kw:'gen ai security platform',vol:0,from:0,to:0,d:0}],
  },
  'OT Security': {
    TOFU: [{kw:'ics/ot',vol:140,from:87,to:35,d:52},{kw:'ot security monitoring',vol:110,from:25,to:10,d:15},{kw:'ot vulnerabilities',vol:140,from:17,to:35,d:-18},{kw:'ot security tools',vol:170,from:1,to:5,d:-4},{kw:'iot security',vol:5400,from:1,to:1,d:0},{kw:'ot cybersecurity',vol:1600,from:1,to:1,d:0},{kw:'operational technology cyber security',vol:390,from:1,to:1,d:0},{kw:'ot security standards',vol:90,from:7,to:7,d:0},{kw:'iot/ot security',vol:70,from:1,to:1,d:0},{kw:'ot security framework',vol:70,from:1,to:1,d:0},{kw:'securing ot networks',vol:70,from:1,to:1,d:0},{kw:'manufacturing ot security',vol:50,from:1,to:1,d:0},{kw:'iot and ot security',vol:40,from:1,to:1,d:0},{kw:'cyber security for operational technology',vol:40,from:1,to:1,d:0}],
    MOFU: [{kw:'ot network architecture',vol:90,from:63,to:15,d:48},{kw:'ot networking',vol:90,from:9,to:4,d:5},{kw:'operational technology examples',vol:70,from:6,to:1,d:5},{kw:'operational technology security',vol:1000,from:2,to:1,d:1},{kw:'ot security meaning',vol:390,from:2,to:1,d:1},{kw:'industrial ot cybersecurity',vol:70,from:47,to:0,d:-99},{kw:'ot/ics cybersecurity',vol:70,from:32,to:54,d:-22},{kw:'what is ot in cybersecurity',vol:90,from:1,to:9,d:-8},{kw:'what is ot cybersecurity',vol:140,from:1,to:8,d:-7},{kw:'what is operational technology',vol:720,from:1,to:4,d:-3},{kw:'ot environment',vol:390,from:1,to:4,d:-3},{kw:'operational technology networks',vol:50,from:3,to:4,d:-1},{kw:'what does ot stand for in cyber security',vol:40,from:1,to:2,d:-1},{kw:'ot security',vol:3600,from:1,to:1,d:0},{kw:'what is ot security',vol:1000,from:1,to:1,d:0},{kw:'ot technology',vol:480,from:1,to:1,d:0},{kw:'ot network security',vol:390,from:1,to:1,d:0},{kw:'ot devices',vol:390,from:1,to:1,d:0},{kw:'operational technology definition',vol:140,from:1,to:1,d:0},{kw:'ot infrastructure',vol:140,from:1,to:1,d:0},{kw:'ot cyber security framework',vol:70,from:3,to:3,d:0},{kw:'ot security architecture',vol:50,from:2,to:2,d:0},{kw:'operational technology network',vol:40,from:4,to:4,d:0},{kw:'ot it security',vol:30,from:1,to:1,d:0}],
    BOFU: [{kw:'ot security assessment',vol:90,from:8,to:6,d:2},{kw:'best ot security companies',vol:70,from:21,to:0,d:-99},{kw:'ot cyber security companies',vol:140,from:1,to:55,d:-54},{kw:'ot cybersecurity vendors',vol:90,from:1,to:21,d:-20},{kw:'ot security companies',vol:210,from:1,to:13,d:-12},{kw:'ot security company',vol:140,from:1,to:5,d:-4},{kw:'ot security solutions',vol:480,from:1,to:1,d:0},{kw:'best ot security for critical infrastructure',vol:140,from:1,to:1,d:0}],
  },
  'Zero Trust': {
    TOFU: [{kw:'what is zero trust networking',vol:70,from:8,to:7,d:1},{kw:'what is zero trust architecture',vol:1300,from:1,to:23,d:-22},{kw:'zero trust architecture',vol:6600,from:1,to:20,d:-19},{kw:'zero trust',vol:9900,from:10,to:17,d:-7},{kw:'what is zero trust',vol:2400,from:1,to:8,d:-7},{kw:'what is zero trust security',vol:1600,from:1,to:8,d:-7},{kw:'ztna security',vol:260,from:1,to:6,d:-5},{kw:'zero trust network',vol:1900,from:1,to:5,d:-4},{kw:'zero trust security',vol:5400,from:1,to:1,d:0},{kw:'zero trust network access',vol:2900,from:1,to:1,d:0},{kw:'zero trust model',vol:1300,from:1,to:1,d:0},{kw:'zero trust security model',vol:1300,from:1,to:1,d:0},{kw:'zero trust access',vol:720,from:1,to:1,d:0},{kw:'what is zero trust network access',vol:720,from:1,to:1,d:0},{kw:'zero trust networking',vol:590,from:1,to:1,d:0},{kw:'zero trust edge',vol:260,from:1,to:1,d:0},{kw:'VPN vs ZTNA',vol:140,from:1,to:1,d:0},{kw:'VPN to ZTNA',vol:30,from:1,to:1,d:0}],
    MOFU: [{kw:'How to migrate from VPN to ZTNA',vol:30,from:1,to:1,d:0}],
    BOFU: [{kw:'ztna',vol:5400,from:1,to:4,d:-3}],
  },
  'Quantum Security': {
    TOFU: [{kw:'Cryptographic Agility',vol:140,from:18,to:1,d:17},{kw:'Crypto-Agility',vol:70,from:17,to:1,d:16},{kw:'what is PQC',vol:170,from:11,to:1,d:10},{kw:'quantum encryption',vol:2900,from:7,to:1,d:6},{kw:'quantum cryptography',vol:18100,from:1,to:25,d:-24},{kw:'quantum readiness',vol:110,from:12,to:23,d:-11},{kw:'post-quantum cryptography',vol:8100,from:15,to:24,d:-9},{kw:'QKD',vol:880,from:1,to:9,d:-8},{kw:'what is QKD',vol:40,from:1,to:6,d:-5},{kw:'post quantum readiness',vol:20,from:13,to:18,d:-5},{kw:'PQC',vol:1900,from:1,to:4,d:-3},{kw:'quantum computing',vol:74000,from:0,to:0,d:0},{kw:'quantum key distribution',vol:1000,from:1,to:1,d:0},{kw:'HNDL',vol:1000,from:0,to:0,d:0},{kw:'quantum security',vol:880,from:1,to:1,d:0},{kw:'q-day',vol:720,from:1,to:1,d:0},{kw:'quantum day',vol:480,from:0,to:0,d:0},{kw:'quantum safe encryption',vol:390,from:1,to:1,d:0},{kw:'harvest now decrypt later',vol:210,from:0,to:0,d:0},{kw:'quantum computing security',vol:170,from:1,to:1,d:0},{kw:'NIST PQC standards',vol:70,from:0,to:0,d:0},{kw:'quantum security solutions',vol:40,from:1,to:1,d:0},{kw:'what is q-day',vol:30,from:1,to:1,d:0},{kw:"Shor's and Grover's Algorithms",vol:20,from:1,to:1,d:0},{kw:'what is HNDL',vol:20,from:0,to:0,d:0},{kw:'Quantum-Safe Security',vol:10,from:1,to:1,d:0},{kw:'what is quatum security',vol:0,from:1,to:1,d:0}],
    MOFU: [{kw:'Quantum-Risk Assessment',vol:20,from:1,to:1,d:0}],
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
    BOFU: [],
  },
};


<<<<<<< HEAD

=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
const KW_FUNNEL_MAP: Record<string,'TOFU'|'MOFU'|'BOFU'> = {
  // NGFW — TOFU
  'what is a firewall':'TOFU','firewall':'TOFU','web application firewall':'TOFU',
  'firewalls':'TOFU','firewall configuration':'TOFU','hardware firewall':'TOFU',
  'network firewall':'TOFU','network firewall security':'TOFU','waf security':'TOFU',
  'what is enterprise firewall':'MOFU','ngfw definition':'MOFU',
  'advantages to next generation firewalls':'MOFU','next generation enterprise firewall':'MOFU',
  // NGFW — BOFU
  'ngfw':'BOFU','next generation firewall':'BOFU','firewall next generation':'BOFU',
  'next gen firewall':'BOFU','enterprise firewall':'BOFU','small business firewall':'BOFU',
  'business firewall':'BOFU','business firewall solutions':'BOFU','enterprise grade firewall':'BOFU',
  'firewall price':'BOFU','firewall cost':'BOFU','layer 3 firewall':'BOFU',
  'network firewall security price':'BOFU','network firewall price':'BOFU',
  'cheap firewall':'BOFU','firewall security price':'BOFU','nexgen firewall':'BOFU',
  'firewall price comparison':'BOFU','firewall security price in usa':'BOFU',
  'how much is a network firewall':'BOFU','low cost firewall':'BOFU',
  'physical firewall prices':'BOFU','next generation application firewall':'BOFU',
  'add a next generation firewall':'BOFU','ngfw products':'BOFU',
  'next generation firewall appliance':'BOFU','affordable firewall':'BOFU',
  'enterprise firewall router':'BOFU','price of hardware firewall':'BOFU',
  'network firewall cost':'BOFU','network based firewall':'BOFU',
  'enterprise security firewall':'BOFU',
  // SD-WAN — TOFU
  'wan':'TOFU','sd wan':'TOFU','sd-wan':'TOFU','sdwan':'TOFU','wan definition':'TOFU',
  'what is sd-wan':'TOFU','sd wan security':'TOFU','sd wan explained':'TOFU',
  'sd wan technology':'TOFU','what is sd wan':'TOFU',
  // SD-WAN — MOFU
  'sd wan vs mpls':'MOFU','managed sd wan solutions':'MOFU',
  // SD-WAN — BOFU
  'managed sd wan':'BOFU','sd wan companies':'BOFU','top sd wan vendors':'BOFU',
  'top sd wan providers':'BOFU','best sd wan':'BOFU','sd wan vendors comparison':'BOFU',
  'sd wan for small business':'BOFU','sd wan and cloud':'BOFU',
  'sd wan hardware vendors':'BOFU','sd wan multi cloud':'BOFU',
  'small business wan':'BOFU','sd wan ready':'BOFU','managed service sd wan':'BOFU',
  'sd wan managed services':'BOFU',
  // NAC — TOFU
  'access control':'TOFU','byod':'TOFU','iot security':'TOFU',
  'identity access management':'TOFU','network access control':'TOFU',
  'iam identity access management':'TOFU','what is network access control':'TOFU',
  'access control security':'TOFU','bring your own device':'TOFU',
  // NAC — MOFU
  'access control management':'MOFU','access control services':'MOFU',
  'access control list example':'MOFU','types of access control list':'MOFU',
  'identity and access management system':'MOFU','access control technologies':'MOFU',
  // NAC — BOFU
  'nac solutions':'BOFU','iot security solutions':'BOFU','iot firewall':'BOFU',
  'access control solutions':'BOFU','access control devices':'BOFU',
  'network access control products':'BOFU','nac service':'BOFU',
  'nac network access control products':'BOFU','nac technology':'BOFU',
  'network access control software':'BOFU',
  // Zero Trust — TOFU
  'zero trust':'TOFU','zero trust architecture':'TOFU','zero trust security':'TOFU',
  'zero trust network access':'TOFU','what is zero trust':'TOFU',
  'zero trust model':'TOFU','zero trust network':'TOFU',
  'what is zero trust security':'TOFU','what is zero trust networking':'TOFU',
  'what is zero trust network access':'TOFU','zero trust security model':'TOFU',
  'vpn vs ztna':'MOFU',
  // Zero Trust — BOFU
  'ztna':'BOFU',
  // Top Opportunities — TOFU
  'vpn':'TOFU','zero day':'TOFU','cybersecurity':'TOFU','proxy':'TOFU',
  'what is malware':'TOFU','what is phishing':'TOFU','phishing':'TOFU',
  'ips':'TOFU','malware':'TOFU','ddos':'TOFU','ransomware':'TOFU',
  'ddos attack':'TOFU','multi factor authentication':'TOFU','oauth':'TOFU','iam':'TOFU',
  'internet of things':'TOFU','proxy server':'TOFU','what is a proxy server':'TOFU',
  'phishing definition':'TOFU','how does vpn work':'TOFU','malware definition':'TOFU',
  // Top Opportunities — BOFU
  'ethernet switch':'BOFU','vpn service':'BOFU',
  // AI Cybersecurity — TOFU
  'ai in cybersecurity':'TOFU','ai security':'TOFU','deepfake ai':'TOFU',
  'ai data center':'TOFU','ai adoption':'TOFU','ai deepfakes':'TOFU',
  'how can generative ai be used in cybersecurity':'TOFU',
  'artificial intelligence in cybersecurity':'TOFU','ai security risk':'TOFU',
  'ai cybersecurity':'TOFU','cybersecurity and ai':'TOFU','what is ai security':'TOFU',
  // AI Cybersecurity — MOFU
  'aiops':'MOFU','ai secops':'MOFU',
  // AI Cybersecurity — BOFU
  'ai cybersecurity tools':'BOFU','ai security solutions':'BOFU',
  'gen ai security solutions':'BOFU','ai cybersecurity certification':'BOFU',
  'ai cybersecurity software':'BOFU','aiops tools':'BOFU','aiops software':'BOFU',
  'aiops platforms':'BOFU','aiops vendors':'BOFU','ai cybersecurity providers':'BOFU',
  'ai cyber security companies':'BOFU','best ai security companies':'BOFU',
  'ai security vendor':'BOFU','which are the top ai security companies':'BOFU',
  'what companies provide ai security platforms':'BOFU','ai security platfrom':'BOFU',
  'ai security software':'BOFU','ai security services':'BOFU',
  'ai security companies':'BOFU','ai security providers':'BOFU',
  'ai cybersecurity solutions':'BOFU','top ai cybersecurity vendors':'BOFU',
  'list of ai cybersecurity tools':'BOFU','gen ai security platform':'BOFU',
  // OT Security — TOFU
  'ot security':'TOFU','ot cybersecurity':'TOFU','what is ot security':'TOFU',
  'operational technology security':'TOFU','what is operational technology':'TOFU',
  'ot technology':'TOFU','ot network security':'TOFU',
  'operational technology cyber security':'TOFU','ot/ics cybersecurity':'TOFU',
  'ot network architecture':'TOFU',
  // OT Security — BOFU
  'ot security solutions':'BOFU','best ot security for critical infrastructure':'BOFU',
  'ot cyber security companies':'BOFU','ot security companies':'BOFU',
  'ot security assessment':'BOFU','ot security company':'BOFU',
  'best ot security companies':'BOFU','ot cybersecurity vendors':'BOFU',
  // Quantum Security — TOFU
  'post-quantum cryptography':'TOFU','pqc':'TOFU','quantum key distribution':'TOFU',
  'quantum security':'TOFU','qkd':'TOFU','q-day':'TOFU','quantum computing':'TOFU',
  'quantum cryptography':'TOFU','harvest now decrypt later':'TOFU',
  'post quantum readiness':'TOFU','quantum readiness':'TOFU','what is pqc':'TOFU',
  // Quantum Security — MOFU
  'quantum encryption':'MOFU','post-quantum cryptography standards':'MOFU',
  'cryptographic agility':'MOFU',
  // Quantum Security — BOFU
  'pqc migration':'BOFU','quantum security solutions':'BOFU',
  // SASE — TOFU
  'sase':'TOFU','sase meaning':'TOFU','what is sase':'TOFU',
  'secure access service edge':'TOFU','security service edge':'TOFU',
  'sase architecture':'TOFU','sase definition':'TOFU','sase network':'TOFU','sse':'TOFU',
  'sase providers':'MOFU','sase vendors':'MOFU','ai sase':'MOFU','what is sse':'TOFU',
  // SASE — BOFU
  'sase solutions':'BOFU','single vendor sase':'BOFU','ai powered sase':'BOFU',
  'sase provider':'BOFU','sase security platform':'BOFU',
};

// ═══════════════════ UTILS ═══════════════════
function fmtVol(v: number | null | undefined): string {
  if(!v||v===0)return'—';
  if(v>=1000000)return(v/1000000).toFixed(1)+'M';
  if(v>=1000)return(v/1000).toFixed(0)+'K';
  return String(v);
}
function rankColor(r: number | null): string {
  if(!r)return'rgba(226,232,240,0.8)';
  if(r===1)return'rgba(10,122,85,.35)';
  if(r<=3)return'rgba(10,122,85,.22)';
  if(r<=5)return'rgba(26,86,219,.28)';
  if(r<=10)return'rgba(180,83,9,.28)';
  if(r<=20)return'rgba(217,48,37,.25)';
  return'rgba(217,48,37,.4)';
}
function rankTextColor(r: number | null): string {
  if(!r)return'#94A3B8';
  if(r===1)return'#065F46';
  if(r<=5)return'#1E40AF';
  if(r<=10)return'#92400E';
  return'#B71C1C';
}
function catClass(cat: string): string {
  const m: Record<string,string>={'Top Opportunities':'fn-cat-top','NAC':'fn-cat-nac','NGFW':'fn-cat-ngfw','Zero Trust':'fn-cat-zt','SD-WAN':'fn-cat-sdwan','AI Cybersecurity':'fn-cat-ai','OT Security':'fn-cat-ot','Quantum Security':'fn-cat-qsec','SASE':'fn-cat-sase'};
  return m[cat]||'';
}
function rankBadgeClass(r: number | null | undefined): string {
  if(r==null||r===0)return'fn-r-bad';
  if(r===1)return'fn-r1';
  if(r<=5)return'fn-r2';
  if(r<=15)return'fn-r3';
  return'fn-r-bad';
}
function catColor(cat: string): string {
  const m: Record<string,string>={'Top Opportunities':'#D93025','NAC':'#1A56DB','NGFW':'#0A7A55','Zero Trust':'#7C3AED','SD-WAN':'#B45309','AI Cybersecurity':'#F59E0B','OT Security':'#6366F1','Quantum Security':'#EC4899','SASE':'#06B6D4'};
  return m[cat]||'#64748B';
}


// ═══════════════════ TRAFFIC DATA (GSC + GA) ═════════════════════════════
<<<<<<< HEAD
// Source: GSC and Google Analytics · WW · Weekly (Sun–Sat) · Dec 31, 2025 → Oct 7, 2026
const TRAFFIC_WEEKS = ["Dec 31","Jan 7","Jan 14","Jan 21","Jan 28","Feb 4","Feb 11","Feb 18","Feb 25","Mar 4","Mar 11","Mar 18","Mar 25","Apr 1","Apr 8","Apr 15","Apr 22","Apr 29","May 6","May 13","May 20","May 27","Jun 3","Jun 10","Jun 17","Jun 24","Jul 1","Jul 8","Jul 15","Jul 22","Jul 29","Aug 5","Aug 12","Aug 19","Aug 26","Sep 2","Sep 9","Sep 16","Sep 23","Sep 30","Oct 7"];

const TRAFFIC_DATA = {
  allOrganic:    [210631,176959,316108,334632,364458,378345,381452,378974,338014,369274,368718,375747,347444,356155,315669,340454,360656,356914,313707,337993,339539,337851,299861,312500,323536,320217,316566,292047,295550,296426,286447,282713,275762,248282,266180,261225,270161,279346,285662,283336,284951],
  branded:       [94649,78586,142605,149523,157485,166374,166231,164636,144463,156891,160076,161115,147779,149305,134728,143435,150963,150830,131068,143951,144878,144807,124964,135587,141935,144808,146688,136851,136376,136031,130392,129066,125682,114823,119056,117587,120028,120522,123289,124744,126752],
  nonBranded:    [39288,40198,49403,48703,58219,53000,54194,54751,51917,56701,54652,57196,54727,56595,51413,54790,55508,52613,50198,52563,52384,51477,53723,53212,51608,49493,47593,44792,45258,49945,49541,47616,47821,46272,50583,48192,49893,51530,50569,50195,50413],
  cyberglossary: [28520,26589,39739,41834,45887,48672,52580,52634,47755,53200,51533,50918,47597,49458,42574,49203,50212,49308,44057,43776,44339,42874,39714,40927,41433,39499,34981,31242,33064,33968,31122,31575,30970,28903,33015,31935,33641,34806,34225,33387,33363],
  homePage:      [4015,4194,7729,7354,8766,10028,9409,9416,8592,9150,9092,9112,8097,8091,7579,7921,8061,8308,7562,7443,7215,7125,6534,7257,7480,7532,6862,6273,6476,7034,6604,6676,6394,6462,6623,6407,6455,6523,6575,6786,6550],
  blog:          [2367,2035,3287,3044,4489,6859,4721,3944,3377,3629,3651,3661,3397,3195,2908,3226,3179,4108,2765,2583,2837,2845,2358,2663,2870,4331,8003,4199,3436,2887,2496,2345,2221,1982,2184,2148,2112,2040,2257,2004,2059],
  articles:      [105,103,202,242,253,293,300,295,302,320,300,307,289,284,250,272,287,272,272,267,271,512,223,266,266,301,260,223,274,252,197,188,192,192,186,192,195,223,214,192,194],
  solutions:     [1924,1476,3234,3607,3987,4180,4220,4071,3690,3911,3884,3875,3439,3756,3280,3748,4087,3995,3352,3447,3678,3808,3307,3394,3625,3437,3252,2724,3005,2958,2840,2791,2747,2575,2768,2750,2984,2723,2739,2511,2443],
  products:      [11506,8012,17221,17963,19108,24515,21018,20441,18352,19705,19869,20187,18187,18320,16348,18329,18971,19683,16354,17264,19084,18894,16757,18090,18741,17792,17544,15656,16173,16032,15130,15109,15177,15297,16775,16650,16806,15258,14657,13891,14643],
  aboutUs:       [3449,2575,5423,5305,5821,5941,6116,5757,5285,5674,5792,6404,5733,5700,5105,6373,6783,6953,5191,5223,5664,5684,5497,5638,5734,5735,5170,5063,5991,5981,5638,6149,5959,5596,6338,6015,5176,5289,5206,4601,4901],
  directGA:         [86307,70744,115528,128971,109499,116029,129917,132972,143019,103659,108183,137028,109527,172648,144528,121981,126870,147052,125088,134833,139674,161698,174868,211459,190773,178866,137219,118425,121673,97430,94872,108806,80664,79635,93322,113930,97017,86343,98178,109243,94012],
  directValid:      [84818,69655,113813,126840,107416,104294,106257,99542,93837,100631,106607,122660,108027,114502,100915,109946,115443,122067,123372,133085,137827,160335,173188,190245,189354,177375,130958,93841,97883,95654,92233,90687,79426,77517,86569,86469,84631,82858,89254,84207,91441],
  directDownloads:  [67661,55300,88620,100997,80696,77972,77950,71720,69697,74282,79827,95874,82542,89435,76641,84386,89510,96310,100756,108863,113223,134726,150400,165439,164061,151928,104612,67503,77458,77959,74905,74030,63034,61210,69769,70394,68463,67302,73146,67872,73413],
  referrals:        [8173,6700,10133,10290,11142,12690,12115,11349,9783,10671,10872,11469,10297,10249,9866,11459,10878,11521,10057,10872,11487,12067,10627,11341,10831,10640,13624,10239,10810,11337,11299,10729,10384,9278,10623,10570,10810,10424,11842,10866,18594],
};

// WoW change values (Sep 30 → Oct 7)
const TRAFFIC_WOW = {
  allOrganic:       {pct:  0.57,  abs:1615},
  branded:          {pct:  1.61,  abs:2008},
  nonBranded:       {pct:  0.43,  abs:218},
  cyberglossary:    {pct: -0.07,  abs:-24},
  homePage:         {pct: -3.48,  abs:-236},
  blog:             {pct:  2.74,  abs:55},
  articles:         {pct:  1.04,  abs:2},
  solutions:        {pct: -2.71,  abs:-68},
  products:         {pct:  5.41,  abs:752},
  aboutUs:          {pct:  6.52,  abs:300},
  directGA:         {pct:-13.94,  abs:-15231},
  directValid:      {pct:  8.59,  abs:7234},
  directDownloads:  {pct:  8.16,  abs:5541},
  referrals:        {pct: 71.12,  abs:7728},
};

type KwRow = {kw:string;funnel:string;sv:number;prev:string;cur:number|string};
const RANK_11_100:KwRow[] = [
  {kw:'cybersecurity',funnel:'TOFU',sv:201000,prev:'-',cur:24},
  {kw:'what is malware',funnel:'TOFU',sv:135000,prev:'23',cur:20},
  {kw:'ips',funnel:'TOFU',sv:49500,prev:'21',cur:12},
  {kw:'malware',funnel:'TOFU',sv:40500,prev:'16',cur:16},
  {kw:'iam',funnel:'TOFU',sv:33100,prev:'1',cur:26},
  {kw:'iot',funnel:'TOFU',sv:27100,prev:'31',cur:30},
  {kw:'phishing definition',funnel:'TOFU',sv:27100,prev:'20',cur:21},
  {kw:'internet of things',funnel:'TOFU',sv:22200,prev:'28',cur:29},
  {kw:'saml',funnel:'TOFU',sv:18100,prev:'28',cur:11},
  {kw:'two factor authentication',funnel:'TOFU',sv:12100,prev:'15',cur:13},
  {kw:'web application firewall',funnel:'TOFU',sv:9900,prev:'23',cur:11},
  {kw:'zero trust architecture',funnel:'TOFU',sv:6600,prev:'20',cur:17},
  {kw:'aiops',funnel:'TOFU',sv:5400,prev:'25',cur:34},
  {kw:'ai data center',funnel:'TOFU',sv:5400,prev:'1',cur:34},
  {kw:'network firewall',funnel:'TOFU',sv:3600,prev:'17',cur:18},
  {kw:'network firewall',funnel:'TOFU',sv:3600,prev:'17',cur:18},
  {kw:'identity access management',funnel:'TOFU',sv:2900,prev:'1',cur:26},
  {kw:'what is zero trust',funnel:'TOFU',sv:2400,prev:'8',cur:76},
  {kw:'aiops tools',funnel:'BOFU',sv:1900,prev:'31',cur:13},
  {kw:'PQC',funnel:'TOFU',sv:1900,prev:'4',cur:18},
  {kw:'ai cybersecurity risks',funnel:'TOFU',sv:1600,prev:'19',cur:23},
  {kw:'what are ai data centers',funnel:'TOFU',sv:1000,prev:'11',cur:12},
  {kw:'ai red teaming',funnel:'TOFU',sv:880,prev:'1',cur:23},
  {kw:'how do deepfakes work',funnel:'TOFU',sv:720,prev:'22',cur:18},
  {kw:'access control management',funnel:'TOFU',sv:720,prev:'20',cur:31},
  {kw:'ai cybersecurity threats',funnel:'TOFU',sv:480,prev:'14',cur:13},
  {kw:'artificial intelligence data center',funnel:'TOFU',sv:480,prev:'-',cur:21},
  {kw:'managed sd wan solutions',funnel:'TOFU',sv:480,prev:'-',cur:53},
  {kw:'layer 7 firewall',funnel:'TOFU',sv:390,prev:'30',cur:22},
  {kw:'enterprise firewall',funnel:'BOFU',sv:320,prev:'14',cur:11},
  {kw:'fully managed sd wan',funnel:'MOFU',sv:320,prev:'-',cur:27},
  {kw:'wan aggregation',funnel:'TOFU',sv:260,prev:'1',cur:37},
  {kw:'sdn wan',funnel:'TOFU',sv:260,prev:'1',cur:34},
  {kw:'ai driven security',funnel:'MOFU',sv:210,prev:'7',cur:21},
  {kw:'aiops vendors',funnel:'BOFU',sv:210,prev:'-',cur:12},
  {kw:'generative ai adoption',funnel:'MOFU',sv:210,prev:'9',cur:12},
  {kw:'managed service sd wan',funnel:'TOFU',sv:210,prev:'-',cur:26},
  {kw:'sd wan for small business',funnel:'BOFU',sv:170,prev:'1',cur:29},
  {kw:'how to setup a firewall',funnel:'TOFU',sv:140,prev:'1',cur:25},
  {kw:'operational technology definition',funnel:'MOFU',sv:140,prev:'1',cur:44},
  {kw:'ot vulnerabilities',funnel:'TOFU',sv:140,prev:'35',cur:21},
  {kw:'Cryptographic Agility',funnel:'TOFU',sv:140,prev:'1',cur:19},
  {kw:'risks of ai in cybersecurity',funnel:'TOFU',sv:110,prev:'43',cur:21},
  {kw:'ot security monitoring',funnel:'TOFU',sv:110,prev:'10',cur:57},
  {kw:'wan providers',funnel:'TOFU',sv:110,prev:'-',cur:35},
  {kw:'ot network architecture',funnel:'MOFU',sv:90,prev:'15',cur:56},
  {kw:'ot cybersecurity vendors',funnel:'BOFU',sv:90,prev:'21',cur:20},
  {kw:'best sd wan providers',funnel:'MOFU',sv:90,prev:'-',cur:23},
  {kw:'layer 3 firewall',funnel:'BOFU',sv:70,prev:'32',cur:31},
  {kw:'iot/ot security',funnel:'TOFU',sv:70,prev:'1',cur:12},
  {kw:'ot/ics cybersecurity',funnel:'MOFU',sv:70,prev:'54',cur:16},
  {kw:'sd wan overview',funnel:'TOFU',sv:70,prev:'1',cur:34},
  {kw:'sd wan lte',funnel:'TOFU',sv:70,prev:'19',cur:12},
  {kw:'what does aiops stand for',funnel:'TOFU',sv:50,prev:'-',cur:21},
  {kw:'wan cost',funnel:'TOFU',sv:50,prev:'32',cur:19},
  {kw:'sd wan security concerns',funnel:'TOFU',sv:50,prev:'1',cur:54},
  {kw:'leading sd wan vendors',funnel:'MOFU',sv:50,prev:'-',cur:45},
  {kw:'enterprise firewall router',funnel:'BOFU',sv:40,prev:'1',cur:20},
  {kw:'iot and ot security',funnel:'TOFU',sv:40,prev:'1',cur:53},
  {kw:'quantum security solutions',funnel:'TOFU',sv:40,prev:'1',cur:56},
  {kw:'Ai Sase',funnel:'MOFU',sv:40,prev:'8',cur:25},
  {kw:'nac security solution',funnel:'TOFU',sv:30,prev:'2',cur:82},
  {kw:'enterprise grade firewall',funnel:'BOFU',sv:30,prev:'33',cur:17},
  {kw:'secure web gateway vs next generation firewall',funnel:'TOFU',sv:30,prev:'11',cur:14},
  {kw:'next generation firewall features list',funnel:'MOFU',sv:30,prev:'6',cur:15},
  {kw:'sd wan access',funnel:'TOFU',sv:30,prev:'1',cur:56},
  {kw:'sd wan data center',funnel:'TOFU',sv:30,prev:'14',cur:14},
  {kw:'ai security providers',funnel:'BOFU',sv:20,prev:'1',cur:11},
  {kw:'network access control technologies',funnel:'TOFU',sv:20,prev:'1',cur:91},
  {kw:'affordable firewall',funnel:'BOFU',sv:20,prev:'13',cur:11},
  {kw:'post quantum readiness',funnel:'TOFU',sv:20,prev:'18',cur:22},
  {kw:'sdn sd wan',funnel:'TOFU',sv:20,prev:'1',cur:43},
  {kw:'ai security use case',funnel:'MOFU',sv:0,prev:'23',cur:23},
  {kw:'ai security vendor',funnel:'BOFU',sv:0,prev:'-',cur:20},
  {kw:'ai security platfrom',funnel:'BOFU',sv:0,prev:'29',cur:65},
];

const NOT_RANKING:KwRow[] = [
  {kw:'zero day',funnel:'TOFU',sv:368000,prev:'-',cur:'-'},
  {kw:'quantum computing',funnel:'TOFU',sv:74000,prev:'-',cur:'-'},
  {kw:'phishing',funnel:'TOFU',sv:49500,prev:'26',cur:'-'},
  {kw:'encryption',funnel:'TOFU',sv:22200,prev:'-',cur:'-'},
  {kw:'quantum cryptography',funnel:'TOFU',sv:18100,prev:'25',cur:'-'},
  {kw:'multi factor authentication',funnel:'TOFU',sv:14800,prev:'30',cur:'-'},
  {kw:'what is a proxy',funnel:'TOFU',sv:12100,prev:'3',cur:'-'},
  {kw:'vpn service',funnel:'MOFU',sv:9900,prev:'-',cur:'-'},
  {kw:'phishing email',funnel:'TOFU',sv:9900,prev:'-',cur:'-'},
  {kw:'ai governance',funnel:'TOFU',sv:8100,prev:'-',cur:'-'},
  {kw:'post-quantum cryptography',funnel:'TOFU',sv:8100,prev:'24',cur:'-'},
  {kw:'malware definition',funnel:'TOFU',sv:8100,prev:'1',cur:'-'},
  {kw:'encryption definition',funnel:'TOFU',sv:6600,prev:'3',cur:'-'},
=======
// Source: GSC and Google Analytics · WW · Weekly (Sun–Sat) · Dec 31, 2025 → Sep 30, 2026
const TRAFFIC_WEEKS = ["Dec 31","Jan 7","Jan 14","Jan 21","Jan 28","Feb 4","Feb 11","Feb 18","Feb 25","Mar 4","Mar 11","Mar 18","Mar 25","Apr 1","Apr 8","Apr 15","Apr 22","Apr 29","May 6","May 13","May 20","May 27","Jun 3","Jun 10","Jun 17","Jun 24","Jul 1","Jul 8","Jul 15","Jul 22","Jul 29","Aug 5","Aug 12","Aug 19","Aug 26","Sep 2","Sep 9","Sep 16","Sep 23","Sep 30"];

const TRAFFIC_DATA = {
  allOrganic:    [210631,176959,316108,334632,364458,378345,381452,378974,338014,369274,368718,375747,347444,356155,315669,340454,360656,356914,313707,337993,339539,337851,299861,312500,323536,320217,316566,292047,295550,296426,286447,282713,275762,248282,266180,261225,270161,279346,285662,283336],
  branded:       [94649,78586,142605,149523,157485,166374,166231,164636,144463,156891,160076,161115,147779,149305,134728,143435,150963,150830,131068,143951,144878,144807,124964,135587,141935,144808,146688,136851,136376,136031,130392,129066,125682,114823,119056,117587,120028,120522,123289,124744],
  nonBranded:    [39288,40198,49403,48703,58219,53000,54194,54751,51917,56701,54652,57196,54727,56595,51413,54790,55508,52613,50198,52563,52384,51477,53723,53212,51608,49493,47593,44792,45258,49945,49541,47616,47821,46272,50583,48192,49893,51530,50569,50195],
  cyberglossary: [28520,26589,39739,41834,45887,48672,52580,52634,47755,53200,51533,50918,47597,49458,42574,49203,50212,49308,44057,43776,44339,42874,39714,40927,41433,39499,34981,31242,33064,33968,31122,31575,30970,28903,33015,31935,33641,34806,34225,33387],
  homePage:      [4015,4194,7729,7354,8766,10028,9409,9416,8592,9150,9092,9112,8097,8091,7579,7921,8061,8308,7562,7443,7215,7125,6534,7257,7480,7532,6862,6273,6476,7034,6604,6676,6394,6462,6623,6407,6455,6523,6575,6786],
  blog:          [2367,2035,3287,3044,4489,6859,4721,3944,3377,3629,3651,3661,3397,3195,2908,3226,3179,4108,2765,2583,2837,2845,2358,2663,2870,4331,8003,4199,3436,2887,2496,2345,2221,1982,2184,2148,2112,2040,2257,2004],
  articles:      [105,103,202,242,253,293,300,295,302,320,300,307,289,284,250,272,287,272,272,267,271,512,223,266,266,301,260,223,274,252,197,188,192,192,186,192,195,223,214,192],
  solutions:     [1924,1476,3234,3607,3987,4180,4220,4071,3690,3911,3884,3875,3439,3756,3280,3748,4087,3995,3352,3447,3678,3808,3307,3394,3625,3437,3252,2724,3005,2958,2840,2791,2747,2575,2768,2750,2984,2723,2739,2511],
  products:      [11506,8012,17221,17963,19108,24515,21018,20441,18352,19705,19869,20187,18187,18320,16348,18329,18971,19683,16354,17264,19084,18894,16757,18090,18741,17792,17544,15656,16173,16032,15130,15109,15177,15297,16775,16650,16806,15258,14657,13891],
  aboutUs:       [3449,2575,5423,5305,5821,5941,6116,5757,5285,5674,5792,6404,5733,5700,5105,6373,6783,6953,5191,5223,5664,5684,5497,5638,5734,5735,5170,5063,5991,5981,5638,6149,5959,5596,6338,6015,5176,5289,5206,4601],
  directGA:         [86307,70744,115528,128971,109499,116029,129917,132972,143019,103659,108183,137028,109527,172648,144528,121981,126870,147052,125088,134833,139674,161698,174868,211459,190773,178866,137219,118425,121673,97430,94872,108806,80664,79635,93322,113930,97017,86343,98178,109243],
  directValid:      [84818,69655,113813,126840,107416,104294,106257,99542,93837,100631,106607,122660,108027,114502,100915,109946,115443,122067,123372,133085,137827,160335,173188,190245,189354,177375,130958,93841,97883,95654,92233,90687,79426,77517,86569,86469,84631,82858,89254,84207],
  directDownloads:  [67661,55300,88620,100997,80696,77972,77950,71720,69697,74282,79827,95874,82542,89435,76641,84386,89510,96310,100756,108863,113223,134726,150400,165439,164061,151928,104612,67503,77458,77959,74905,74030,63034,61210,69769,70394,68463,67302,73146,67872],
  referrals:        [8173,6700,10133,10290,11142,12690,12115,11349,9783,10671,10872,11469,10297,10249,9866,11459,10878,11521,10057,10872,11487,12067,10627,11341,10831,10640,13624,10239,10810,11337,11299,10729,10384,9278,10623,10570,10810,10424,11842,10866],
};

// WoW change values (Sep 23 → Sep 30)
const TRAFFIC_WOW = {
  allOrganic:       {pct: -0.81,  abs:-2326},
  branded:          {pct:  1.18,  abs:1455},
  nonBranded:       {pct: -0.74,  abs:-374},
  cyberglossary:    {pct: -2.45,  abs:-838},
  homePage:         {pct:  3.21,  abs:211},
  blog:             {pct:-11.21,  abs:-253},
  articles:         {pct:-10.28,  abs:-22},
  solutions:        {pct: -8.32,  abs:-228},
  products:         {pct: -5.23,  abs:-766},
  aboutUs:          {pct:-11.62,  abs:-605},
  directGA:         {pct: 11.27,  abs:11065},
  directValid:      {pct: -5.65,  abs:-5047},
  directDownloads:  {pct: -7.21,  abs:-5274},
  referrals:        {pct: -8.24,  abs:-976},
};

type KwRow = {kw:string;funnel:string;sv:number;prev:string;cur:number|string};
const uniqKw = (rows:KwRow[]):KwRow[] => { const seen = new Set<string>(); return rows.filter(r => { const k = r.kw.trim().toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }); };
const RANK_11_100_RAW:KwRow[] = [
  {kw:'vpn',funnel:'TOFU',sv:673000,prev:'13',cur:12},
  {kw:'proxy',funnel:'TOFU',sv:201000,prev:'3',cur:21},
  {kw:'what is malware',funnel:'TOFU',sv:135000,prev:'25',cur:23},
  {kw:'phishing',funnel:'TOFU',sv:49500,prev:'67',cur:26},
  {kw:'ips',funnel:'TOFU',sv:49500,prev:'15',cur:21},
  {kw:'malware',funnel:'TOFU',sv:40500,prev:'16',cur:16},
  {kw:'wan',funnel:'TOFU',sv:33100,prev:'1',cur:21},
  {kw:'wan',funnel:'TOFU',sv:33100,prev:'1',cur:21},
  {kw:'iot',funnel:'TOFU',sv:27100,prev:'34',cur:31},
  {kw:'phishing definition',funnel:'TOFU',sv:27100,prev:'1',cur:20},
  {kw:'internet of things',funnel:'TOFU',sv:22200,prev:'27',cur:28},
  {kw:'quantum cryptography',funnel:'TOFU',sv:18100,prev:'1',cur:25},
  {kw:'saml',funnel:'TOFU',sv:18100,prev:'18',cur:28},
  {kw:'multi factor authentication',funnel:'TOFU',sv:14800,prev:'26',cur:30},
  {kw:'two factor authentication',funnel:'TOFU',sv:12100,prev:'10',cur:15},
  {kw:'oauth',funnel:'TOFU',sv:12100,prev:'19',cur:14},
  {kw:'web application firewall',funnel:'TOFU',sv:9900,prev:'1',cur:23},
  {kw:'zero trust',funnel:'TOFU',sv:9900,prev:'10',cur:17},
  {kw:'post-quantum cryptography',funnel:'TOFU',sv:8100,prev:'15',cur:24},
  {kw:'AI security',funnel:'TOFU',sv:6600,prev:'16',cur:16},
  {kw:'sd wan',funnel:'TOFU',sv:6600,prev:'1',cur:11},
  {kw:'sd-wan',funnel:'TOFU',sv:6600,prev:'2',cur:18},
  {kw:'sd wan',funnel:'TOFU',sv:6600,prev:'1',cur:11},
  {kw:'sd-wan',funnel:'TOFU',sv:6600,prev:'2',cur:18},
  {kw:'zero trust architecture',funnel:'TOFU',sv:6600,prev:'1',cur:20},
  {kw:'aiops',funnel:'TOFU',sv:5400,prev:'1',cur:25},
  {kw:'deepfake ai',funnel:'TOFU',sv:5400,prev:'5',cur:21},
  {kw:'network firewall',funnel:'TOFU',sv:3600,prev:'1',cur:17},
  {kw:'network firewall',funnel:'TOFU',sv:3600,prev:'1',cur:17},
  {kw:'list of ai cybersecurity tools',funnel:'BOFU',sv:2400,prev:'21',cur:23},
  {kw:'aiops tools',funnel:'BOFU',sv:1900,prev:'-',cur:31},
  {kw:'ai cybersecurity risks',funnel:'TOFU',sv:1600,prev:'22',cur:19},
  {kw:'what is zero trust architecture',funnel:'TOFU',sv:1300,prev:'1',cur:23},
  {kw:'agentic ai security',funnel:'TOFU',sv:1000,prev:'-',cur:22},
  {kw:'what are ai data centers',funnel:'TOFU',sv:1000,prev:'-',cur:11},
  {kw:'deepfakes meaning',funnel:'TOFU',sv:1000,prev:'1',cur:16},
  {kw:'ai adoption framework',funnel:'MOFU',sv:1000,prev:'24',cur:20},
  {kw:'Generative ai security',funnel:'TOFU',sv:720,prev:'-',cur:49},
  {kw:'artificial intelligence security',funnel:'MOFU',sv:720,prev:'7',cur:13},
  {kw:'how do deepfakes work',funnel:'TOFU',sv:720,prev:'31',cur:22},
  {kw:'access control management',funnel:'TOFU',sv:720,prev:'60',cur:20},
  {kw:'ai security software',funnel:'BOFU',sv:590,prev:'14',cur:14},
  {kw:'sd wan providers',funnel:'TOFU',sv:590,prev:'-',cur:12},
  {kw:'ai cybersecurity threats',funnel:'TOFU',sv:480,prev:'12',cur:14},
  {kw:'generative ai in cybersecurity',funnel:'MOFU',sv:480,prev:'13',cur:13},
  {kw:'waf firewall',funnel:'TOFU',sv:480,prev:'1',cur:21},
  {kw:'layer 7 firewall',funnel:'TOFU',sv:390,prev:'37',cur:30},
  {kw:'sd wan vendors',funnel:'MOFU',sv:390,prev:'-',cur:24},
  {kw:'enterprise firewall',funnel:'BOFU',sv:320,prev:'28',cur:14},
  {kw:'access control meaning',funnel:'TOFU',sv:260,prev:'3',cur:20},
  {kw:'ot security companies',funnel:'BOFU',sv:210,prev:'1',cur:13},
  {kw:'ai security frameworks',funnel:'MOFU',sv:140,prev:'-',cur:16},
  {kw:'aiops definition',funnel:'TOFU',sv:140,prev:'35',cur:24},
  {kw:'ics/ot',funnel:'TOFU',sv:140,prev:'87',cur:35},
  {kw:'ot vulnerabilities',funnel:'TOFU',sv:140,prev:'17',cur:35},
  {kw:'ot cyber security companies',funnel:'BOFU',sv:140,prev:'1',cur:55},
  {kw:'risks of ai in cybersecurity',funnel:'TOFU',sv:110,prev:'39',cur:43},
  {kw:'ai data center architecture',funnel:'MOFU',sv:110,prev:'14',cur:13},
  {kw:'quantum readiness',funnel:'TOFU',sv:110,prev:'12',cur:23},
  {kw:'cloud managed sd wan',funnel:'MOFU',sv:110,prev:'3',cur:27},
  {kw:'ot network architecture',funnel:'MOFU',sv:90,prev:'63',cur:15},
  {kw:'ot cybersecurity vendors',funnel:'BOFU',sv:90,prev:'1',cur:21},
  {kw:'sd wan vendors comparison',funnel:'BOFU',sv:90,prev:'-',cur:24},
  {kw:'aiops network',funnel:'MOFU',sv:70,prev:'11',cur:11},
  {kw:'layer 3 firewall',funnel:'BOFU',sv:70,prev:'-',cur:32},
  {kw:'ot/ics cybersecurity',funnel:'MOFU',sv:70,prev:'32',cur:54},
  {kw:'sd wan visibility',funnel:'MOFU',sv:70,prev:'78',cur:92},
  {kw:'sd wan lte',funnel:'TOFU',sv:70,prev:'1',cur:19},
  {kw:'what are aiops',funnel:'TOFU',sv:50,prev:'1',cur:17},
  {kw:'wan cost',funnel:'TOFU',sv:50,prev:'33',cur:32},
  {kw:'benefits of ai data center',funnel:'MOFU',sv:40,prev:'15',cur:15},
  {kw:'mpls vs hybrid wan',funnel:'TOFU',sv:40,prev:'1',cur:20},
  {kw:'enterprise grade firewall',funnel:'BOFU',sv:30,prev:'14',cur:33},
  {kw:'ngfw network',funnel:'TOFU',sv:30,prev:'1',cur:11},
  {kw:'secure web gateway vs next generation firewall',funnel:'TOFU',sv:30,prev:'15',cur:11},
  {kw:'Ai Powered Sase',funnel:'BOFU',sv:30,prev:'6',cur:11},
  {kw:'sd wan lan',funnel:'TOFU',sv:30,prev:'1',cur:12},
  {kw:'sd wan data center',funnel:'TOFU',sv:30,prev:'1',cur:14},
  {kw:'sd wan brands',funnel:'TOFU',sv:30,prev:'16',cur:14},
  {kw:'cheap firewall',funnel:'BOFU',sv:20,prev:'13',cur:14},
  {kw:'affordable firewall',funnel:'BOFU',sv:20,prev:'13',cur:13},
  {kw:'post quantum readiness',funnel:'TOFU',sv:20,prev:'13',cur:18},
  {kw:'sd wan price list',funnel:'TOFU',sv:20,prev:'1',cur:11},
  {kw:'sd wan ready',funnel:'TOFU',sv:20,prev:'1',cur:18},
  {kw:'ai cybersecurity providers',funnel:'BOFU',sv:10,prev:'19',cur:18},
  {kw:'ai security use case',funnel:'MOFU',sv:0,prev:'25',cur:23},
  {kw:'deepfake ai examples',funnel:'TOFU',sv:0,prev:'15',cur:17},
  {kw:'ai security platfrom',funnel:'BOFU',sv:0,prev:'33',cur:29},
];
const RANK_11_100:KwRow[] = uniqKw(RANK_11_100_RAW);

const NOT_RANKING:KwRow[] = [
  {kw:'zero day',funnel:'TOFU',sv:368000,prev:'-',cur:'-'},
  {kw:'cybersecurity',funnel:'TOFU',sv:201000,prev:'1',cur:'-'},
  {kw:'quantum computing',funnel:'TOFU',sv:74000,prev:'-',cur:'-'},
  {kw:'encryption',funnel:'TOFU',sv:22200,prev:'24',cur:'-'},
  {kw:'Sse',funnel:'TOFU',sv:14800,prev:'1',cur:'-'},
  {kw:'ethernet switch',funnel:'BOFU',sv:14800,prev:'-',cur:'-'},
  {kw:'vpn service',funnel:'MOFU',sv:9900,prev:'-',cur:'-'},
  {kw:'phishing email',funnel:'TOFU',sv:9900,prev:'30',cur:'-'},
  {kw:'ai governance',funnel:'TOFU',sv:8100,prev:'-',cur:'-'},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'frontier ai',funnel:'TOFU',sv:3600,prev:'-',cur:'-'},
  {kw:'ai in risk management',funnel:'MOFU',sv:3600,prev:'-',cur:'-'},
  {kw:'ai risk management',funnel:'MOFU',sv:3600,prev:'-',cur:'-'},
  {kw:'ai governance framework',funnel:'TOFU',sv:2900,prev:'-',cur:'-'},
<<<<<<< HEAD
  {kw:'what is an ai data center',funnel:'TOFU',sv:2400,prev:'-',cur:'-'},
  {kw:'list of ai cybersecurity tools',funnel:'BOFU',sv:2400,prev:'23',cur:'-'},
  {kw:'bring your own device',funnel:'TOFU',sv:2400,prev:'-',cur:'-'},
  {kw:'what is iam',funnel:'TOFU',sv:1900,prev:'1',cur:'-'},
  {kw:'access control solutions',funnel:'BOFU',sv:1900,prev:'-',cur:'-'},
  {kw:'aiops platforms',funnel:'BOFU',sv:1300,prev:'1',cur:'-'},
  {kw:'ai risk management framework',funnel:'MOFU',sv:1300,prev:'-',cur:'-'},
  {kw:'ai risk assessment',funnel:'MOFU',sv:1300,prev:'-',cur:'-'},
  {kw:'ai adoption framework',funnel:'MOFU',sv:1000,prev:'20',cur:'-'},
  {kw:'HNDL',funnel:'TOFU',sv:1000,prev:'-',cur:'-'},
  {kw:'managed sd wan',funnel:'TOFU',sv:1000,prev:'2',cur:'-'},
  {kw:'how can generative ai be used in cybersecurity',funnel:'TOFU',sv:880,prev:'8',cur:'-'},
=======
  {kw:'what is an ai data center',funnel:'TOFU',sv:2400,prev:'27',cur:'-'},
  {kw:'bring your own device',funnel:'TOFU',sv:2400,prev:'-',cur:'-'},
  {kw:'what is aiops',funnel:'TOFU',sv:1900,prev:'12',cur:'-'},
  {kw:'access control solutions',funnel:'BOFU',sv:1900,prev:'-',cur:'-'},
  {kw:'What Is Sse',funnel:'TOFU',sv:1900,prev:'1',cur:'-'},
  {kw:'ai risk management framework',funnel:'MOFU',sv:1300,prev:'-',cur:'-'},
  {kw:'ai risk assessment',funnel:'MOFU',sv:1300,prev:'-',cur:'-'},
  {kw:'HNDL',funnel:'TOFU',sv:1000,prev:'-',cur:'-'},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'ai operations',funnel:'MOFU',sv:880,prev:'-',cur:'-'},
  {kw:'access control technologies',funnel:'MOFU',sv:880,prev:'-',cur:'-'},
  {kw:'sd wan managed services',funnel:'TOFU',sv:880,prev:'-',cur:'-'},
  {kw:'enterprise ai adoption',funnel:'MOFU',sv:720,prev:'-',cur:'-'},
  {kw:'ai adoption challenges',funnel:'MOFU',sv:720,prev:'-',cur:'-'},
<<<<<<< HEAD
  {kw:'ai security companies',funnel:'BOFU',sv:720,prev:'1',cur:'-'},
  {kw:'ai cybersecurity certification',funnel:'BOFU',sv:590,prev:'-',cur:'-'},
  {kw:'aiops software',funnel:'BOFU',sv:590,prev:'-',cur:'-'},
  {kw:'ai security software',funnel:'BOFU',sv:590,prev:'14',cur:'-'},
  {kw:'access control devices',funnel:'BOFU',sv:590,prev:'-',cur:'-'},
  {kw:'sd wan providers',funnel:'TOFU',sv:590,prev:'12',cur:'-'},
  {kw:'generative ai in cybersecurity',funnel:'MOFU',sv:480,prev:'13',cur:'-'},
  {kw:'quantum day',funnel:'TOFU',sv:480,prev:'-',cur:'-'},
  {kw:'ai siem',funnel:'MOFU',sv:390,prev:'-',cur:'-'},
  {kw:'ai security best practices',funnel:'MOFU',sv:390,prev:'-',cur:'-'},
  {kw:'sd wan vendors',funnel:'MOFU',sv:390,prev:'24',cur:'-'},
  {kw:'artificial intelligence risk management framework',funnel:'MOFU',sv:320,prev:'-',cur:'-'},
=======
  {kw:'ai cybersecurity certification',funnel:'BOFU',sv:590,prev:'-',cur:'-'},
  {kw:'aiops software',funnel:'BOFU',sv:590,prev:'13',cur:'-'},
  {kw:'access control devices',funnel:'BOFU',sv:590,prev:'-',cur:'-'},
  {kw:'artificial intelligence data center',funnel:'TOFU',sv:480,prev:'26',cur:'-'},
  {kw:'quantum day',funnel:'TOFU',sv:480,prev:'-',cur:'-'},
  {kw:'managed sd wan solutions',funnel:'TOFU',sv:480,prev:'-',cur:'-'},
  {kw:'ai siem',funnel:'MOFU',sv:390,prev:'-',cur:'-'},
  {kw:'ai security best practices',funnel:'MOFU',sv:390,prev:'-',cur:'-'},
  {kw:'artificial intelligence risk management framework',funnel:'MOFU',sv:320,prev:'-',cur:'-'},
  {kw:'fully managed sd wan',funnel:'MOFU',sv:320,prev:'30',cur:'-'},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'ai and risk management',funnel:'MOFU',sv:260,prev:'-',cur:'-'},
  {kw:'ai for risk management',funnel:'MOFU',sv:260,prev:'-',cur:'-'},
  {kw:'ai adoption by industry',funnel:'TOFU',sv:260,prev:'-',cur:'-'},
  {kw:'ai adoption statistics',funnel:'TOFU',sv:260,prev:'-',cur:'-'},
<<<<<<< HEAD
  {kw:'access control meaning',funnel:'TOFU',sv:260,prev:'20',cur:'-'},
  {kw:'sd wan router',funnel:'TOFU',sv:260,prev:'-',cur:'-'},
  {kw:'acls networking',funnel:'TOFU',sv:210,prev:'2',cur:'-'},
  {kw:'harvest now decrypt later',funnel:'TOFU',sv:210,prev:'-',cur:'-'},
  {kw:'sd wan companies',funnel:'BOFU',sv:210,prev:'-',cur:'-'},
  {kw:'sd wan appliance',funnel:'TOFU',sv:210,prev:'8',cur:'-'},
  {kw:'generative ai for cybersecurity',funnel:'MOFU',sv:170,prev:'-',cur:'-'},
  {kw:'strategic ai adoption',funnel:'MOFU',sv:170,prev:'1',cur:'-'},
  {kw:'ai adoption in healthcare',funnel:'MOFU',sv:170,prev:'-',cur:'-'},
  {kw:'ai cyber security companies',funnel:'BOFU',sv:170,prev:'1',cur:'-'},
  {kw:'what is PQC',funnel:'TOFU',sv:170,prev:'1',cur:'-'},
  {kw:'ai security frameworks',funnel:'MOFU',sv:140,prev:'16',cur:'-'},
  {kw:'ai cybersecurity incidents',funnel:'TOFU',sv:140,prev:'2',cur:'-'},
  {kw:'aiops monitoring',funnel:'MOFU',sv:140,prev:'-',cur:'-'},
  {kw:'artificial intelligence risk management',funnel:'TOFU',sv:140,prev:'-',cur:'-'},
  {kw:'ai adoption rate',funnel:'TOFU',sv:140,prev:'-',cur:'-'},
  {kw:'ics/ot',funnel:'TOFU',sv:140,prev:'35',cur:'-'},
  {kw:'ot cyber security companies',funnel:'BOFU',sv:140,prev:'55',cur:'-'},
  {kw:'sdn in the wan',funnel:'TOFU',sv:140,prev:'2',cur:'-'},
  {kw:'ai powered security',funnel:'MOFU',sv:110,prev:'3',cur:'-'},
  {kw:'access control examples',funnel:'TOFU',sv:110,prev:'1',cur:'-'},
  {kw:'quantum readiness',funnel:'TOFU',sv:110,prev:'23',cur:'-'},
  {kw:'top sd wan providers',funnel:'BOFU',sv:110,prev:'-',cur:'-'},
  {kw:'cloud managed sd wan',funnel:'MOFU',sv:110,prev:'27',cur:'-'},
  {kw:'aiops framework',funnel:'MOFU',sv:90,prev:'9',cur:'-'},
  {kw:'aiops capabilities',funnel:'MOFU',sv:90,prev:'1',cur:'-'},
  {kw:'ai model risk management',funnel:'MOFU',sv:90,prev:'-',cur:'-'},
  {kw:'enterprise ai adoption trends',funnel:'MOFU',sv:90,prev:'-',cur:'-'},
  {kw:'networking acl',funnel:'TOFU',sv:90,prev:'1',cur:'-'},
  {kw:'best sd wan',funnel:'BOFU',sv:90,prev:'-',cur:'-'},
  {kw:'mpls to sd wan',funnel:'TOFU',sv:90,prev:'1',cur:'-'},
  {kw:'best sd wan vendors',funnel:'MOFU',sv:90,prev:'-',cur:'-'},
  {kw:'ai impact on data centers',funnel:'MOFU',sv:70,prev:'-',cur:'-'},
  {kw:'aiops trends',funnel:'MOFU',sv:70,prev:'-',cur:'-'},
  {kw:'aiops network',funnel:'MOFU',sv:70,prev:'11',cur:'-'},
  {kw:'ai adoption in financial services',funnel:'MOFU',sv:70,prev:'-',cur:'-'},
  {kw:'industrial ot cybersecurity',funnel:'MOFU',sv:70,prev:'-',cur:'-'},
  {kw:'best ot security companies',funnel:'BOFU',sv:70,prev:'-',cur:'-'},
  {kw:'Crypto-Agility',funnel:'TOFU',sv:70,prev:'1',cur:'-'},
  {kw:'NIST PQC standards',funnel:'TOFU',sv:70,prev:'-',cur:'-'},
  {kw:'top sd wan vendors',funnel:'BOFU',sv:70,prev:'-',cur:'-'},
  {kw:'sd wan automation',funnel:'MOFU',sv:70,prev:'-',cur:'-'},
  {kw:'ai automation in cybersecurity',funnel:'MOFU',sv:50,prev:'5',cur:'-'},
  {kw:'aiops networking',funnel:'MOFU',sv:50,prev:'7',cur:'-'},
  {kw:'what is ai risk management',funnel:'TOFU',sv:50,prev:'-',cur:'-'},
  {kw:'enterprise ai adoption challenges',funnel:'MOFU',sv:50,prev:'-',cur:'-'},
  {kw:'types of access control list',funnel:'TOFU',sv:50,prev:'7',cur:'-'},
  {kw:'sd wan appliances',funnel:'TOFU',sv:50,prev:'-',cur:'-'},
  {kw:'benefits of ai data center',funnel:'MOFU',sv:40,prev:'15',cur:'-'},
  {kw:'ai and machine learning for risk management',funnel:'MOFU',sv:40,prev:'-',cur:'-'},
  {kw:'nac service',funnel:'BOFU',sv:40,prev:'-',cur:'-'},
  {kw:'network access control policy',funnel:'TOFU',sv:40,prev:'2',cur:'-'},
  {kw:'benefits of access control list',funnel:'TOFU',sv:40,prev:'1',cur:'-'},
  {kw:'what is next generation firewalls',funnel:'TOFU',sv:40,prev:'1',cur:'-'},
  {kw:'ai data center trends',funnel:'MOFU',sv:30,prev:'-',cur:'-'},
  {kw:'ngfw network',funnel:'TOFU',sv:30,prev:'11',cur:'-'},
  {kw:'ngfw products',funnel:'BOFU',sv:30,prev:'2',cur:'-'},
  {kw:'sd wan hardware vendors',funnel:'BOFU',sv:30,prev:'-',cur:'-'},
  {kw:'sd wan as a service pricing',funnel:'TOFU',sv:30,prev:'9',cur:'-'},
  {kw:'what is the difference between wan and mpls',funnel:'TOFU',sv:30,prev:'1',cur:'-'},
  {kw:'cheap firewall',funnel:'BOFU',sv:20,prev:'14',cur:'-'},
  {kw:'what is HNDL',funnel:'TOFU',sv:20,prev:'-',cur:'-'},
  {kw:'sd wan ready',funnel:'TOFU',sv:20,prev:'18',cur:'-'},
  {kw:'acl access control lists',funnel:'TOFU',sv:10,prev:'1',cur:'-'},
  {kw:'gen ai security solutions',funnel:'BOFU',sv:0,prev:'-',cur:'-'},
  {kw:'data center challenges in ai',funnel:'MOFU',sv:0,prev:'-',cur:'-'},
  {kw:'deepfake ai examples',funnel:'TOFU',sv:0,prev:'17',cur:'-'},
  {kw:'deepfake ai challenges',funnel:'MOFU',sv:0,prev:'-',cur:'-'},
  {kw:'what industries benefit most from ai adoption',funnel:'TOFU',sv:0,prev:'-',cur:'-'},
  {kw:'what frameworks guide successful ai adoption',funnel:'TOFU',sv:0,prev:'-',cur:'-'},
  {kw:'gen ai security platform',funnel:'BOFU',sv:0,prev:'-',cur:'-'},
];

const AIO_KEYWORDS:KwRow[] = [
  {kw:'vpn',funnel:'TOFU',sv:673000,prev:'12',cur:1},
  {kw:'proxy',funnel:'TOFU',sv:201000,prev:'21',cur:2},
  {kw:'ddos',funnel:'TOFU',sv:33100,prev:'1',cur:1},
  {kw:'proxy server',funnel:'TOFU',sv:33100,prev:'4',cur:1},
=======
  {kw:'sd wan router',funnel:'TOFU',sv:260,prev:'-',cur:'-'},
  {kw:'aiops vendors',funnel:'BOFU',sv:210,prev:'-',cur:'-'},
  {kw:'harvest now decrypt later',funnel:'TOFU',sv:210,prev:'-',cur:'-'},
  {kw:'sd wan companies',funnel:'BOFU',sv:210,prev:'-',cur:'-'},
  {kw:'managed service sd wan',funnel:'TOFU',sv:210,prev:'6',cur:'-'},
  {kw:'generative ai for cybersecurity',funnel:'MOFU',sv:170,prev:'-',cur:'-'},
  {kw:'ai adoption in healthcare',funnel:'MOFU',sv:170,prev:'-',cur:'-'},
  {kw:'aiops monitoring',funnel:'MOFU',sv:140,prev:'50',cur:'-'},
  {kw:'artificial intelligence risk management',funnel:'TOFU',sv:140,prev:'-',cur:'-'},
  {kw:'ai adoption rate',funnel:'TOFU',sv:140,prev:'-',cur:'-'},
  {kw:'business sd wan',funnel:'MOFU',sv:140,prev:'-',cur:'-'},
  {kw:'wan providers',funnel:'TOFU',sv:110,prev:'-',cur:'-'},
  {kw:'top sd wan providers',funnel:'BOFU',sv:110,prev:'-',cur:'-'},
  {kw:'ai based security system',funnel:'MOFU',sv:90,prev:'1',cur:'-'},
  {kw:'ai model risk management',funnel:'MOFU',sv:90,prev:'-',cur:'-'},
  {kw:'enterprise ai adoption trends',funnel:'MOFU',sv:90,prev:'-',cur:'-'},
  {kw:'best sd wan',funnel:'BOFU',sv:90,prev:'-',cur:'-'},
  {kw:'best sd wan providers',funnel:'MOFU',sv:90,prev:'-',cur:'-'},
  {kw:'best sd wan vendors',funnel:'MOFU',sv:90,prev:'-',cur:'-'},
  {kw:'ai impact on data centers',funnel:'MOFU',sv:70,prev:'-',cur:'-'},
  {kw:'aiops trends',funnel:'MOFU',sv:70,prev:'-',cur:'-'},
  {kw:'ai adoption in financial services',funnel:'MOFU',sv:70,prev:'-',cur:'-'},
  {kw:'industrial ot cybersecurity',funnel:'MOFU',sv:70,prev:'47',cur:'-'},
  {kw:'best ot security companies',funnel:'BOFU',sv:70,prev:'21',cur:'-'},
  {kw:'NIST PQC standards',funnel:'TOFU',sv:70,prev:'-',cur:'-'},
  {kw:'top sd wan vendors',funnel:'BOFU',sv:70,prev:'-',cur:'-'},
  {kw:'sd wan automation',funnel:'MOFU',sv:70,prev:'42',cur:'-'},
  {kw:'what does aiops stand for',funnel:'TOFU',sv:50,prev:'1',cur:'-'},
  {kw:'what is ai risk management',funnel:'TOFU',sv:50,prev:'-',cur:'-'},
  {kw:'enterprise ai adoption challenges',funnel:'MOFU',sv:50,prev:'-',cur:'-'},
  {kw:'sd wan appliances',funnel:'TOFU',sv:50,prev:'-',cur:'-'},
  {kw:'leading sd wan vendors',funnel:'MOFU',sv:50,prev:'-',cur:'-'},
  {kw:'ai and machine learning for risk management',funnel:'MOFU',sv:40,prev:'-',cur:'-'},
  {kw:'nac service',funnel:'BOFU',sv:40,prev:'-',cur:'-'},
  {kw:'ai data center trends',funnel:'MOFU',sv:30,prev:'-',cur:'-'},
  {kw:'sd wan hardware vendors',funnel:'BOFU',sv:30,prev:'-',cur:'-'},
  {kw:'what is HNDL',funnel:'TOFU',sv:20,prev:'-',cur:'-'},
  {kw:'gen ai security solutions',funnel:'BOFU',sv:0,prev:'-',cur:'-'},
  {kw:'data center challenges in ai',funnel:'MOFU',sv:0,prev:'-',cur:'-'},
  {kw:'deepfake ai best practices',funnel:'MOFU',sv:0,prev:'-',cur:'-'},
  {kw:'deepfake ai challenges',funnel:'MOFU',sv:0,prev:'-',cur:'-'},
  {kw:'what industries benefit most from ai adoption',funnel:'TOFU',sv:0,prev:'-',cur:'-'},
  {kw:'what frameworks guide successful ai adoption',funnel:'TOFU',sv:0,prev:'-',cur:'-'},
  {kw:'ai security vendor',funnel:'BOFU',sv:0,prev:'1',cur:'-'},
  {kw:'gen ai security platform',funnel:'BOFU',sv:0,prev:'-',cur:'-'},
];

const AIO_KEYWORDS_RAW:KwRow[] = [
  {kw:'ddos',funnel:'TOFU',sv:33100,prev:'1',cur:1},
  {kw:'iam',funnel:'TOFU',sv:33100,prev:'1',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'firewall',funnel:'TOFU',sv:27100,prev:'1',cur:1},
  {kw:'firewall',funnel:'TOFU',sv:27100,prev:'1',cur:1},
  {kw:'AI in cybersecurity',funnel:'TOFU',sv:22200,prev:'1',cur:1},
  {kw:'ddos attack',funnel:'TOFU',sv:18100,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'what is a proxy server',funnel:'TOFU',sv:18100,prev:'3',cur:1},
  {kw:'sase',funnel:'TOFU',sv:14800,prev:'1',cur:1},
  {kw:'Sse',funnel:'TOFU',sv:14800,prev:'-',cur:1},
  {kw:'ethernet switch',funnel:'BOFU',sv:14800,prev:'-',cur:1},
  {kw:'sase',funnel:'TOFU',sv:14800,prev:'1',cur:1},
  {kw:'access control',funnel:'TOFU',sv:12100,prev:'3',cur:1},
  {kw:'single sign on',funnel:'TOFU',sv:12100,prev:'8',cur:1},
  {kw:'oauth',funnel:'TOFU',sv:12100,prev:'14',cur:1},
  {kw:'access control',funnel:'TOFU',sv:12100,prev:'3',cur:1},
  {kw:'byod',funnel:'TOFU',sv:9900,prev:'1',cur:1},
  {kw:'qos',funnel:'TOFU',sv:9900,prev:'1',cur:1},
  {kw:'byod',funnel:'TOFU',sv:9900,prev:'1',cur:1},
  {kw:'zero trust',funnel:'TOFU',sv:9900,prev:'17',cur:1},
  {kw:'ddos meaning',funnel:'TOFU',sv:8100,prev:'1',cur:1},
  {kw:'AI security',funnel:'TOFU',sv:6600,prev:'16',cur:1},
  {kw:'sdwan',funnel:'TOFU',sv:6600,prev:'5',cur:1},
  {kw:'wan definition',funnel:'TOFU',sv:6600,prev:'1',cur:1},
  {kw:'sdwan',funnel:'TOFU',sv:6600,prev:'5',cur:1},
  {kw:'firewalls',funnel:'TOFU',sv:5400,prev:'1',cur:1},
  {kw:'firewall configuration',funnel:'TOFU',sv:5400,prev:'1',cur:1},
  {kw:'iot security',funnel:'TOFU',sv:5400,prev:'1',cur:1},
  {kw:'firewalls',funnel:'TOFU',sv:5400,prev:'1',cur:1},
  {kw:'zero trust security',funnel:'TOFU',sv:5400,prev:'1',cur:1},
  {kw:'ai cybersecurity',funnel:'TOFU',sv:4400,prev:'3',cur:1},
  {kw:'network firewall security',funnel:'TOFU',sv:4400,prev:'1',cur:1},
  {kw:'ngfw',funnel:'BOFU',sv:4400,prev:'1',cur:1},
  {kw:'hardware firewall',funnel:'TOFU',sv:4400,prev:'1',cur:1},
=======
  {kw:'Sase',funnel:'TOFU',sv:14800,prev:'1',cur:1},
  {kw:'sase',funnel:'TOFU',sv:14800,prev:'1',cur:1},
  {kw:'byod',funnel:'TOFU',sv:9900,prev:'1',cur:1},
  {kw:'qos',funnel:'TOFU',sv:9900,prev:'1',cur:1},
  {kw:'byod',funnel:'TOFU',sv:9900,prev:'1',cur:1},
  {kw:'ddos meaning',funnel:'TOFU',sv:8100,prev:'6',cur:1},
  {kw:'malware definition',funnel:'TOFU',sv:8100,prev:'17',cur:1},
  {kw:'wan definition',funnel:'TOFU',sv:6600,prev:'1',cur:1},
  {kw:'ai data center',funnel:'TOFU',sv:5400,prev:'53',cur:1},
  {kw:'firewalls',funnel:'TOFU',sv:5400,prev:'4',cur:1},
  {kw:'firewall configuration',funnel:'TOFU',sv:5400,prev:'1',cur:1},
  {kw:'iot security',funnel:'TOFU',sv:5400,prev:'1',cur:1},
  {kw:'firewalls',funnel:'TOFU',sv:5400,prev:'4',cur:1},
  {kw:'zero trust security',funnel:'TOFU',sv:5400,prev:'1',cur:1},
  {kw:'network firewall security',funnel:'TOFU',sv:4400,prev:'1',cur:1},
  {kw:'ngfw',funnel:'BOFU',sv:4400,prev:'3',cur:1},
  {kw:'hardware firewall',funnel:'TOFU',sv:4400,prev:'5',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'Sase Meaning',funnel:'TOFU',sv:4400,prev:'1',cur:1},
  {kw:'how does vpn work',funnel:'TOFU',sv:4400,prev:'1',cur:1},
  {kw:'iot security',funnel:'TOFU',sv:3600,prev:'1',cur:1},
  {kw:'ot security',funnel:'MOFU',sv:3600,prev:'1',cur:1},
  {kw:'What Is Sase',funnel:'TOFU',sv:3600,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'what is ips',funnel:'TOFU',sv:3600,prev:'1',cur:1},
  {kw:'what is ddos',funnel:'TOFU',sv:3600,prev:'1',cur:1},
  {kw:'network access control',funnel:'TOFU',sv:2900,prev:'1',cur:1},
  {kw:'quantum encryption',funnel:'TOFU',sv:2900,prev:'1',cur:1},
  {kw:'Secure Access Service Edge',funnel:'TOFU',sv:2900,prev:'1',cur:1},
  {kw:'wide area network',funnel:'TOFU',sv:2900,prev:'1',cur:1},
  {kw:'what is wan',funnel:'TOFU',sv:2900,prev:'8',cur:1},
=======
  {kw:'what is ips',funnel:'TOFU',sv:3600,prev:'4',cur:1},
  {kw:'what is ddos',funnel:'TOFU',sv:3600,prev:'22',cur:1},
  {kw:'identity access management',funnel:'TOFU',sv:2900,prev:'23',cur:1},
  {kw:'network access control',funnel:'TOFU',sv:2900,prev:'1',cur:1},
  {kw:'quantum encryption',funnel:'TOFU',sv:2900,prev:'7',cur:1},
  {kw:'Secure Access Service Edge',funnel:'TOFU',sv:2900,prev:'1',cur:1},
  {kw:'wide area network',funnel:'TOFU',sv:2900,prev:'1',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'zero trust network access',funnel:'TOFU',sv:2900,prev:'1',cur:1},
  {kw:'ai adoption',funnel:'TOFU',sv:2400,prev:'1',cur:1},
  {kw:'network security firewall',funnel:'TOFU',sv:2400,prev:'1',cur:1},
  {kw:'network security firewall',funnel:'TOFU',sv:2400,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'what is sd wan',funnel:'TOFU',sv:2400,prev:'1',cur:1},
  {kw:'what is aiops',funnel:'TOFU',sv:1900,prev:'-',cur:1},
  {kw:'iam identity access management',funnel:'TOFU',sv:1900,prev:'1',cur:1},
  {kw:'What Is Sse',funnel:'TOFU',sv:1900,prev:'-',cur:1},
  {kw:'Sase Solutions',funnel:'TOFU',sv:1900,prev:'1',cur:1},
  {kw:'what is sd wan',funnel:'TOFU',sv:1900,prev:'1',cur:1},
  {kw:'zero trust network',funnel:'TOFU',sv:1900,prev:'5',cur:1},
=======
  {kw:'what is sd-wan',funnel:'TOFU',sv:2400,prev:'1',cur:1},
  {kw:'what is iam',funnel:'TOFU',sv:1900,prev:'9',cur:1},
  {kw:'iam identity access management',funnel:'TOFU',sv:1900,prev:'27',cur:1},
  {kw:'firewall settings',funnel:'TOFU',sv:1900,prev:'3',cur:1},
  {kw:'Sase Solutions',funnel:'TOFU',sv:1900,prev:'1',cur:1},
  {kw:'what is sd wan',funnel:'TOFU',sv:1900,prev:'1',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'what does a firewall do',funnel:'TOFU',sv:1600,prev:'1',cur:1},
  {kw:'ot cybersecurity',funnel:'TOFU',sv:1600,prev:'1',cur:1},
  {kw:'Security Service Edge',funnel:'TOFU',sv:1600,prev:'1',cur:1},
  {kw:'sd wan solutions',funnel:'TOFU',sv:1600,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'software defined wan',funnel:'TOFU',sv:1600,prev:'3',cur:1},
  {kw:'nac network',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'stateful firewall',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'what is waf',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'Sase Architecture',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'sd wan meaning',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'zero trust security model',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'what is zero trust architecture',funnel:'TOFU',sv:1300,prev:'23',cur:1},
  {kw:'agentic ai security',funnel:'TOFU',sv:1000,prev:'22',cur:1},
  {kw:'cybersecurity and ai',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'deepfakes meaning',funnel:'TOFU',sv:1000,prev:'16',cur:1},
  {kw:'iot device security',funnel:'TOFU',sv:1000,prev:'7',cur:1},
  {kw:'iot security solutions',funnel:'BOFU',sv:1000,prev:'1',cur:1},
  {kw:'waf meaning',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'stateful vs stateless firewall',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'stateful inspection firewall',funnel:'TOFU',sv:1000,prev:'3',cur:1},
  {kw:'firewall as a service',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'what is ot security',funnel:'MOFU',sv:1000,prev:'1',cur:1},
  {kw:'operational technology security',funnel:'MOFU',sv:1000,prev:'1',cur:1},
=======
  {kw:'aiops platforms',funnel:'BOFU',sv:1300,prev:'-',cur:1},
  {kw:'nac network',funnel:'TOFU',sv:1300,prev:'3',cur:1},
  {kw:'stateful firewall',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'what is waf',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'waf security',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'Sase Architecture',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'sd wan meaning',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'zero trust model',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'zero trust security model',funnel:'TOFU',sv:1300,prev:'1',cur:1},
  {kw:'cybersecurity and ai',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'what is access control',funnel:'TOFU',sv:1000,prev:'6',cur:1},
  {kw:'iot security solutions',funnel:'BOFU',sv:1000,prev:'1',cur:1},
  {kw:'network access control solutions',funnel:'TOFU',sv:1000,prev:'7',cur:1},
  {kw:'waf meaning',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'stateful vs stateless firewall',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'firewall as a service',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'what is ot security',funnel:'MOFU',sv:1000,prev:'1',cur:1},
  {kw:'operational technology security',funnel:'MOFU',sv:1000,prev:'2',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'quantum key distribution',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'Sase Definition',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'Sase Vs Sse',funnel:'TOFU',sv:1000,prev:'1',cur:1},
  {kw:'802.1 x',funnel:'TOFU',sv:1000,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'ai for cybersecurity',funnel:'MOFU',sv:880,prev:'6',cur:1},
=======
  {kw:'ai red teaming',funnel:'TOFU',sv:880,prev:'39',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'ai cybersecurity solutions',funnel:'BOFU',sv:880,prev:'1',cur:1},
  {kw:'internet of things security',funnel:'TOFU',sv:880,prev:'1',cur:1},
  {kw:'what is iot security',funnel:'TOFU',sv:880,prev:'1',cur:1},
  {kw:'quantum security',funnel:'TOFU',sv:880,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'QKD',funnel:'TOFU',sv:880,prev:'9',cur:1},
  {kw:'sd wan vs mpls',funnel:'TOFU',sv:880,prev:'1',cur:1},
  {kw:'Generative ai security',funnel:'TOFU',sv:720,prev:'49',cur:1},
  {kw:'what is ai security',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'artificial intelligence security',funnel:'MOFU',sv:720,prev:'13',cur:1},
  {kw:'what does deepfake mean',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'access control lists',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'bring your own device policy',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'identity and access management system',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'access control services',funnel:'TOFU',sv:720,prev:'4',cur:1},
  {kw:'network firewalls',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'small business firewall',funnel:'BOFU',sv:720,prev:'1',cur:1},
  {kw:'firewall next generation',funnel:'BOFU',sv:720,prev:'4',cur:1},
  {kw:'stateless vs stateful firewall',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'what is operational technology',funnel:'MOFU',sv:720,prev:'4',cur:1},
  {kw:'q-day',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'sd wan explained',funnel:'TOFU',sv:720,prev:'4',cur:1},
=======
  {kw:'sd wan vs mpls',funnel:'TOFU',sv:880,prev:'1',cur:1},
  {kw:'what is ai security',funnel:'TOFU',sv:720,prev:'4',cur:1},
  {kw:'what does deepfake mean',funnel:'TOFU',sv:720,prev:'11',cur:1},
  {kw:'ai security companies',funnel:'BOFU',sv:720,prev:'1',cur:1},
  {kw:'access control lists',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'acl network',funnel:'TOFU',sv:720,prev:'2',cur:1},
  {kw:'bring your own device policy',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'identity and access management system',funnel:'TOFU',sv:720,prev:'35',cur:1},
  {kw:'access control services',funnel:'TOFU',sv:720,prev:'1',cur:4},
  {kw:'network firewalls',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'small business firewall',funnel:'BOFU',sv:720,prev:'2',cur:1},
  {kw:'stateless vs stateful firewall',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'q-day',funnel:'TOFU',sv:720,prev:'1',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'sd wan security',funnel:'MOFU',sv:720,prev:'1',cur:1},
  {kw:'network firewalls',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'zero trust access',funnel:'TOFU',sv:720,prev:'1',cur:1},
  {kw:'what is zero trust network access',funnel:'TOFU',sv:720,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'ai prompt injection',funnel:'TOFU',sv:590,prev:'1',cur:1},
  {kw:'what is identity and access management',funnel:'TOFU',sv:590,prev:'1',cur:1},
  {kw:'how does a firewall work',funnel:'TOFU',sv:590,prev:'1',cur:1},
  {kw:'utm firewall',funnel:'TOFU',sv:590,prev:'2',cur:1},
  {kw:'proxy firewall',funnel:'TOFU',sv:590,prev:'1',cur:1},
  {kw:'stateful firewall vs stateless firewall',funnel:'TOFU',sv:590,prev:'1',cur:1},
  {kw:'zero trust networking',funnel:'TOFU',sv:590,prev:'1',cur:1},
  {kw:'firewalls explained',funnel:'TOFU',sv:480,prev:'2',cur:1},
  {kw:'ot technology',funnel:'MOFU',sv:480,prev:'1',cur:1},
  {kw:'ot security solutions',funnel:'BOFU',sv:480,prev:'1',cur:1},
  {kw:'Secure Access Service Edge SASE',funnel:'TOFU',sv:480,prev:'1',cur:1},
  {kw:'Sase Platform',funnel:'TOFU',sv:480,prev:'1',cur:1},
  {kw:'sd wan benefits',funnel:'TOFU',sv:480,prev:'1',cur:1},
  {kw:'Artificial intelligence in cybersecurity',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'artificial intelligence for it operations',funnel:'MOFU',sv:390,prev:'1',cur:1},
  {kw:'nac solutions',funnel:'BOFU',sv:390,prev:'8',cur:1},
  {kw:'what is network access control',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'nac cyber security',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'what is nac in networking',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'security firewall',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'security firewall',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'network based firewall',funnel:'TOFU',sv:390,prev:'6',cur:1},
  {kw:'operational technology cyber security',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'ot network security',funnel:'MOFU',sv:390,prev:'1',cur:1},
  {kw:'ot security meaning',funnel:'MOFU',sv:390,prev:'1',cur:1},
  {kw:'ot environment',funnel:'MOFU',sv:390,prev:'4',cur:1},
  {kw:'quantum safe encryption',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'Sase Services',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'sd wan definition',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'sd wan technology',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'ai security threats',funnel:'TOFU',sv:320,prev:'5',cur:1},
  {kw:'access control definition',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'iot network security',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'iot network security',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'business firewall',funnel:'BOFU',sv:320,prev:'2',cur:1},
  {kw:'what is a network firewall',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'waf vs firewall',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'Sase Network',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'ai security monitoring',funnel:'MOFU',sv:260,prev:'8',cur:1},
  {kw:'role of ai in cybersecurity',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'access control methods',funnel:'TOFU',sv:260,prev:'5',cur:1},
  {kw:'what is firewall in networking',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'physical firewall',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'what is a stateful firewall',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'Sase Network Security',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'benefits of sd wan',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'software defined wide area network',funnel:'TOFU',sv:260,prev:'3',cur:1},
  {kw:'ethernet switching',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'ztna security',funnel:'TOFU',sv:260,prev:'6',cur:1},
  {kw:'ai powered cybersecurity',funnel:'MOFU',sv:210,prev:'2',cur:1},
  {kw:'nac security',funnel:'TOFU',sv:210,prev:'1',cur:1},
  {kw:'network access control system',funnel:'TOFU',sv:210,prev:'1',cur:1},
  {kw:'nac network access',funnel:'TOFU',sv:210,prev:'1',cur:1},
  {kw:'how firewall works',funnel:'TOFU',sv:210,prev:'1',cur:1},
  {kw:'perimeter firewall',funnel:'TOFU',sv:210,prev:'1',cur:1},
  {kw:'ot security companies',funnel:'BOFU',sv:210,prev:'13',cur:1},
  {kw:'sd wan device',funnel:'TOFU',sv:210,prev:'4',cur:1},
  {kw:'sd wan advantages',funnel:'MOFU',sv:210,prev:'1',cur:1},
  {kw:'ot security tools',funnel:'TOFU',sv:170,prev:'5',cur:1},
  {kw:'quantum computing security',funnel:'TOFU',sv:170,prev:'1',cur:1},
  {kw:'Sase Vs Ztna',funnel:'TOFU',sv:170,prev:'1',cur:1},
  {kw:'Sase Vs Vpn',funnel:'TOFU',sv:170,prev:'1',cur:1},
  {kw:'aiops definition',funnel:'TOFU',sv:140,prev:'24',cur:1},
  {kw:'aiops meaning',funnel:'TOFU',sv:140,prev:'1',cur:1},
  {kw:'nac network security',funnel:'TOFU',sv:140,prev:'3',cur:1},
  {kw:'benefits of firewall',funnel:'TOFU',sv:140,prev:'1',cur:1},
  {kw:'what is ot cybersecurity',funnel:'MOFU',sv:140,prev:'8',cur:1},
  {kw:'ot infrastructure',funnel:'MOFU',sv:140,prev:'1',cur:1},
  {kw:'ot security company',funnel:'BOFU',sv:140,prev:'5',cur:1},
  {kw:'sd wan software',funnel:'TOFU',sv:140,prev:'1',cur:1},
  {kw:'business sd wan',funnel:'MOFU',sv:140,prev:'-',cur:1},
  {kw:'VPN vs ZTNA',funnel:'TOFU',sv:140,prev:'1',cur:1},
  {kw:'ai data center architecture',funnel:'MOFU',sv:110,prev:'13',cur:1},
  {kw:'acl firewall',funnel:'TOFU',sv:110,prev:'1',cur:1},
  {kw:'nac network access control',funnel:'TOFU',sv:110,prev:'1',cur:1},
=======
  {kw:'ai prompt injection',funnel:'TOFU',sv:590,prev:'-',cur:1},
  {kw:'what is identity and access management',funnel:'TOFU',sv:590,prev:'20',cur:1},
  {kw:'how does a firewall work',funnel:'TOFU',sv:590,prev:'1',cur:1},
  {kw:'proxy firewall',funnel:'TOFU',sv:590,prev:'1',cur:1},
  {kw:'stateful firewall vs stateless firewall',funnel:'TOFU',sv:590,prev:'1',cur:1},
  {kw:'zero trust networking',funnel:'TOFU',sv:590,prev:'1',cur:1},
  {kw:'ai adoption strategy',funnel:'MOFU',sv:480,prev:'1',cur:1},
  {kw:'network access control list',funnel:'TOFU',sv:480,prev:'22',cur:1},
  {kw:'ot technology',funnel:'MOFU',sv:480,prev:'1',cur:1},
  {kw:'ot security solutions',funnel:'BOFU',sv:480,prev:'1',cur:1},
  {kw:'Secure Access Service Edge SASE',funnel:'TOFU',sv:480,prev:'1',cur:1},
  {kw:'Sase Providers',funnel:'TOFU',sv:480,prev:'13',cur:1},
  {kw:'Sase Platform',funnel:'TOFU',sv:480,prev:'1',cur:1},
  {kw:'sd wan benefits',funnel:'TOFU',sv:480,prev:'1',cur:1},
  {kw:'Artificial intelligence in cybersecurity',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'artificial intelligence for it operations',funnel:'MOFU',sv:390,prev:'20',cur:1},
  {kw:'what is network access control',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'nac cyber security',funnel:'TOFU',sv:390,prev:'3',cur:1},
  {kw:'what is nac in networking',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'security firewall',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'security firewall',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'next generation firewall ngfw',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'operational technology cyber security',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'ot network security',funnel:'MOFU',sv:390,prev:'1',cur:1},
  {kw:'ot security meaning',funnel:'MOFU',sv:390,prev:'2',cur:1},
  {kw:'ot devices',funnel:'MOFU',sv:390,prev:'1',cur:1},
  {kw:'quantum safe encryption',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'Sase Vs Casb',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'Sase Services',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'sd wan definition',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'sd wan technology',funnel:'TOFU',sv:390,prev:'1',cur:1},
  {kw:'access control definition',funnel:'TOFU',sv:320,prev:'4',cur:1},
  {kw:'iot network security',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'iot network security',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'business firewall',funnel:'BOFU',sv:320,prev:'2',cur:2},
  {kw:'what is a network firewall',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'waf vs firewall',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'Sase Network',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'Sase Provider',funnel:'TOFU',sv:320,prev:'6',cur:1},
  {kw:'Sase Vendor',funnel:'TOFU',sv:320,prev:'1',cur:1},
  {kw:'role of ai in cybersecurity',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'what is firewall in networking',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'physical firewall',funnel:'TOFU',sv:260,prev:'5',cur:1},
  {kw:'what is a stateful firewall',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'Sase Network Security',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'benefits of sd wan',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'wan aggregation',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'sdn wan',funnel:'TOFU',sv:260,prev:'3',cur:1},
  {kw:'ethernet switching',funnel:'TOFU',sv:260,prev:'6',cur:1},
  {kw:'zero trust edge',funnel:'TOFU',sv:260,prev:'1',cur:1},
  {kw:'ai cybersecurity software',funnel:'BOFU',sv:210,prev:'1',cur:1},
  {kw:'preparing for ai adoption',funnel:'MOFU',sv:210,prev:'1',cur:1},
  {kw:'nac security',funnel:'TOFU',sv:210,prev:'3',cur:1},
  {kw:'what is an acl networking',funnel:'TOFU',sv:210,prev:'1',cur:1},
  {kw:'nac network access',funnel:'TOFU',sv:210,prev:'3',cur:1},
  {kw:'how firewall works',funnel:'TOFU',sv:210,prev:'1',cur:1},
  {kw:'perimeter firewall',funnel:'TOFU',sv:210,prev:'1',cur:1},
  {kw:'sd wan advantages',funnel:'MOFU',sv:210,prev:'1',cur:1},
  {kw:'strategic ai adoption',funnel:'MOFU',sv:170,prev:'1',cur:1},
  {kw:'ai cyber security companies',funnel:'BOFU',sv:170,prev:'1',cur:1},
  {kw:'what is next generation firewall',funnel:'TOFU',sv:170,prev:'1',cur:1},
  {kw:'firewall price',funnel:'BOFU',sv:170,prev:'1',cur:1},
  {kw:'firewall setup',funnel:'TOFU',sv:170,prev:'1',cur:1},
  {kw:'quantum computing security',funnel:'TOFU',sv:170,prev:'1',cur:1},
  {kw:'what is PQC',funnel:'TOFU',sv:170,prev:'11',cur:1},
  {kw:'Sase Vs Ztna',funnel:'TOFU',sv:170,prev:'1',cur:1},
  {kw:'Sase Vs Vpn',funnel:'TOFU',sv:170,prev:'1',cur:1},
  {kw:'sd wan for small business',funnel:'BOFU',sv:170,prev:'1',cur:1},
  {kw:'sd wan over mpls',funnel:'TOFU',sv:170,prev:'1',cur:1},
  {kw:'aiops meaning',funnel:'TOFU',sv:140,prev:'13',cur:1},
  {kw:'access control list in networking',funnel:'TOFU',sv:140,prev:'1',cur:1},
  {kw:'how to setup a firewall',funnel:'TOFU',sv:140,prev:'1',cur:1},
  {kw:'proxy server firewall',funnel:'TOFU',sv:140,prev:'1',cur:1},
  {kw:'benefits of firewall',funnel:'TOFU',sv:140,prev:'1',cur:1},
  {kw:'operational technology definition',funnel:'MOFU',sv:140,prev:'1',cur:1},
  {kw:'ot infrastructure',funnel:'MOFU',sv:140,prev:'1',cur:1},
  {kw:'Cryptographic Agility',funnel:'TOFU',sv:140,prev:'18',cur:1},
  {kw:'sd wan software',funnel:'TOFU',sv:140,prev:'4',cur:1},
  {kw:'VPN vs ZTNA',funnel:'TOFU',sv:140,prev:'1',cur:1},
  {kw:'ai secops',funnel:'MOFU',sv:110,prev:'7',cur:1},
  {kw:'enterprise aiops',funnel:'MOFU',sv:110,prev:'1',cur:1},
  {kw:'acl firewall',funnel:'TOFU',sv:110,prev:'1',cur:1},
  {kw:'nac network access control',funnel:'TOFU',sv:110,prev:'1',cur:1},
  {kw:'access control examples',funnel:'TOFU',sv:110,prev:'1',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'nac it',funnel:'TOFU',sv:110,prev:'1',cur:1},
  {kw:'nac technology',funnel:'TOFU',sv:110,prev:'1',cur:1},
  {kw:'utm vs firewall',funnel:'TOFU',sv:110,prev:'1',cur:1},
  {kw:'sd wan explanation',funnel:'TOFU',sv:110,prev:'1',cur:1},
  {kw:'what is wan aggregation',funnel:'TOFU',sv:110,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'deepfake attacks',funnel:'MOFU',sv:90,prev:'1',cur:1},
  {kw:'what is ai adoption',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'ai security services',funnel:'BOFU',sv:90,prev:'6',cur:1},
  {kw:'access control in network security',funnel:'TOFU',sv:90,prev:'4',cur:1},
  {kw:'how firewalls work',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'firewall cost',funnel:'BOFU',sv:90,prev:'1',cur:1},
  {kw:'network firewall price',funnel:'BOFU',sv:90,prev:'1',cur:1},
  {kw:'firewall vs waf',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'next generation firewall appliance',funnel:'BOFU',sv:90,prev:'1',cur:1},
  {kw:'next generation firewall vs utm',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'what is ot in cybersecurity',funnel:'MOFU',sv:90,prev:'9',cur:1},
  {kw:'ot networking',funnel:'MOFU',sv:90,prev:'4',cur:1},
  {kw:'sd wan leaders',funnel:'MOFU',sv:90,prev:'1',cur:1},
  {kw:'sd wan vendors comparison',funnel:'BOFU',sv:90,prev:'24',cur:1},
  {kw:'sd wan with mpls',funnel:'TOFU',sv:90,prev:'3',cur:1},
  {kw:'ai based security',funnel:'MOFU',sv:70,prev:'7',cur:1},
  {kw:'what is deepfake ai',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'adoption of ai for cybersecurity',funnel:'MOFU',sv:70,prev:'10',cur:1},
  {kw:'security for iot devices',funnel:'TOFU',sv:70,prev:'4',cur:1},
  {kw:'network firewall security price',funnel:'BOFU',sv:70,prev:'1',cur:1},
  {kw:'what is proxy firewall',funnel:'TOFU',sv:70,prev:'2',cur:1},
  {kw:'what are software firewalls',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'next generation firewall vs waf',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'network firewall cost',funnel:'BOFU',sv:70,prev:'1',cur:2},
  {kw:'ot security framework',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'operational technology examples',funnel:'MOFU',sv:70,prev:'1',cur:1},
  {kw:'securing ot networks',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'define sd wan',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'advantages of sd wan',funnel:'MOFU',sv:70,prev:'1',cur:1},
  {kw:'wan security measures',funnel:'MOFU',sv:70,prev:'4',cur:1},
  {kw:'what is zero trust networking',funnel:'TOFU',sv:70,prev:'7',cur:1},
  {kw:'what are aiops',funnel:'TOFU',sv:50,prev:'17',cur:1},
  {kw:'nac tools',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'network access control device',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'what is iam security',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'cyber security in iot devices',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'what is utm firewall',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'firewall vs utm',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'border firewall',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'benefits of firewall security',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'How Does Sase Work',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'definition sd wan',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'sd wan for enterprise',funnel:'TOFU',sv:50,prev:'5',cur:1},
  {kw:'what does sd wan mean',funnel:'TOFU',sv:50,prev:'3',cur:1},
  {kw:'difference between sdn and sd wan',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'ai security examples',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'network access control products',funnel:'BOFU',sv:40,prev:'4',cur:1},
  {kw:'configuration of firewall',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'how network firewall works',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'what does ot stand for in cyber security',funnel:'MOFU',sv:40,prev:'2',cur:1},
  {kw:'cyber security for operational technology',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'what is QKD',funnel:'TOFU',sv:40,prev:'6',cur:1},
  {kw:'sdwan explained',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'mpls vs hybrid wan',funnel:'TOFU',sv:40,prev:'20',cur:1},
  {kw:'what is nac security',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'security on iot devices',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'cyber security iot devices',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'application proxy firewall',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'firewall security price',funnel:'BOFU',sv:30,prev:'1',cur:1},
  {kw:'ngfw networking',funnel:'TOFU',sv:30,prev:'1',cur:1},
=======
  {kw:'aiops capabilities',funnel:'MOFU',sv:90,prev:'36',cur:1},
  {kw:'deepfake attacks',funnel:'MOFU',sv:90,prev:'4',cur:1},
  {kw:'what is ai adoption',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'networking acl',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'how firewalls work',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'firewall cost',funnel:'BOFU',sv:90,prev:'1',cur:1},
  {kw:'network firewall price',funnel:'BOFU',sv:90,prev:'2',cur:1},
  {kw:'firewall vs waf',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'next generation firewall appliance',funnel:'BOFU',sv:90,prev:'1',cur:1},
  {kw:'next generation firewall vs utm',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'Sd-Wan Vs Sase',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'sd wan leaders',funnel:'MOFU',sv:90,prev:'1',cur:1},
  {kw:'mpls to sd wan',funnel:'TOFU',sv:90,prev:'3',cur:1},
  {kw:'wan security issues',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'sd wan vs mpls cost comparison',funnel:'TOFU',sv:90,prev:'1',cur:1},
  {kw:'what is deepfake ai',funnel:'TOFU',sv:70,prev:'3',cur:1},
  {kw:'distributed firewall',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'network firewall security price',funnel:'BOFU',sv:70,prev:'1',cur:1},
  {kw:'what are software firewalls',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'next generation firewall vs waf',funnel:'TOFU',sv:70,prev:'4',cur:1},
  {kw:'network firewall cost',funnel:'BOFU',sv:70,prev:'1',cur:1},
  {kw:'iot/ot security',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'ot security framework',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'operational technology examples',funnel:'MOFU',sv:70,prev:'6',cur:1},
  {kw:'securing ot networks',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'Crypto-Agility',funnel:'TOFU',sv:70,prev:'17',cur:1},
  {kw:'sd wan overview',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'define sd wan',funnel:'TOFU',sv:70,prev:'1',cur:1},
  {kw:'advantages of sd wan',funnel:'MOFU',sv:70,prev:'1',cur:1},
  {kw:'sd wan application performance',funnel:'MOFU',sv:70,prev:'14',cur:1},
  {kw:'nac tools',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'what is iam security',funnel:'TOFU',sv:50,prev:'3',cur:1},
  {kw:'network access control benefits',funnel:'TOFU',sv:50,prev:'2',cur:1},
  {kw:'cyber security in iot devices',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'business firewall solutions',funnel:'BOFU',sv:50,prev:'1',cur:1},
  {kw:'what is utm firewall',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'firewall vs utm',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'border firewall',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'benefits of firewall security',funnel:'TOFU',sv:50,prev:'3',cur:1},
  {kw:'manufacturing ot security',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'How Does Sase Work',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'definition sd wan',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'sd wan security concerns',funnel:'TOFU',sv:50,prev:'4',cur:1},
  {kw:'difference between sdn and sd wan',funnel:'TOFU',sv:50,prev:'1',cur:1},
  {kw:'ai security challenges',funnel:'MOFU',sv:40,prev:'1',cur:1},
  {kw:'ai security examples',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'benefits of access control list',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'configuration of firewall',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'what is next generation firewalls',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'how network firewall works',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'next gen firewall magic quadrant',funnel:'MOFU',sv:40,prev:'1',cur:1},
  {kw:'how network firewall is different from application firewall',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'enterprise firewall router',funnel:'BOFU',sv:40,prev:'19',cur:1},
  {kw:'iot and ot security',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'cyber security for operational technology',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'quantum security solutions',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'sdwan explained',funnel:'TOFU',sv:40,prev:'1',cur:1},
  {kw:'wan sd wan',funnel:'TOFU',sv:40,prev:'3',cur:1},
  {kw:'what is nac security',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'security on iot devices',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'cyber security iot devices',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'firewall security price',funnel:'BOFU',sv:30,prev:'1',cur:1},
  {kw:'ngfw networking',funnel:'TOFU',sv:30,prev:'9',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'working of firewall',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'ngfw throughput',funnel:'MOFU',sv:30,prev:'1',cur:1},
  {kw:'how hardware firewall works',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'next generation enterprise firewall',funnel:'MOFU',sv:30,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'difference between next generation firewall and standard firewall',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'advantages to next generation firewall',funnel:'MOFU',sv:30,prev:'1',cur:1},
  {kw:'ot it security',funnel:'MOFU',sv:30,prev:'1',cur:1},
  {kw:'what is q-day',funnel:'TOFU',sv:30,prev:'1',cur:1},
=======
  {kw:'what is the next generation firewall',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'what is next generation firewall ngfw',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'difference between next generation firewall and standard firewall',funnel:'TOFU',sv:30,prev:'21',cur:1},
  {kw:'next generation firewall meaning',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'advantages to next generation firewall',funnel:'MOFU',sv:30,prev:'1',cur:1},
  {kw:'ot it security',funnel:'MOFU',sv:30,prev:'1',cur:1},
  {kw:'what is q-day',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'Sase Service Provider',funnel:'TOFU',sv:30,prev:'1',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'sd wan vs. mpls',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'whats sd wan',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'sd wan connectivity',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'sd wan what is it',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'why use sd wan',funnel:'TOFU',sv:30,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'sdn wan vs mpls',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'sd wan software defined wide area network',funnel:'TOFU',sv:30,prev:'3',cur:1},
  {kw:'sd wan vs vpls',funnel:'TOFU',sv:30,prev:'2',cur:1},
  {kw:'what is sd wan and how does it work',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'VPN to ZTNA',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'ai security benefits',funnel:'MOFU',sv:20,prev:'1',cur:1},
  {kw:'what is ai in cybersecurity',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'best ai security companies',funnel:'BOFU',sv:20,prev:'1',cur:1},
  {kw:'nac computer',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'nac server',funnel:'TOFU',sv:20,prev:'3',cur:1},
  {kw:'nac computer security',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'nac network access control products',funnel:'BOFU',sv:20,prev:'3',cur:1},
=======
  {kw:'sd wan concept',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'sdn wan vs mpls',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'sd wan access',funnel:'TOFU',sv:30,prev:'6',cur:1},
  {kw:'what is sd wan and how does it work',funnel:'TOFU',sv:30,prev:'4',cur:1},
  {kw:'VPN to ZTNA',funnel:'TOFU',sv:30,prev:'1',cur:1},
  {kw:'How to migrate from\u00a0VPN\u00a0to\u00a0ZTNA',funnel:'MOFU',sv:30,prev:'1',cur:1},
  {kw:'ai security benefits',funnel:'MOFU',sv:20,prev:'2',cur:1},
  {kw:'what is ai in cybersecurity',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'deepfake ai technology',funnel:'MOFU',sv:20,prev:'1',cur:1},
  {kw:'best ai security companies',funnel:'BOFU',sv:20,prev:'1',cur:1},
  {kw:'ai security providers',funnel:'BOFU',sv:20,prev:'1',cur:1},
  {kw:'nac computer',funnel:'TOFU',sv:20,prev:'4',cur:1},
  {kw:'nac computer security',funnel:'TOFU',sv:20,prev:'1',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'how to secure iot network',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'transparent firewalls',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'layer 2 firewall',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'network firewall definition',funnel:'TOFU',sv:20,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'firewall security price in usa',funnel:'BOFU',sv:20,prev:'1',cur:1},
  {kw:'price of hardware firewall',funnel:'BOFU',sv:20,prev:'1',cur:1},
  {kw:"Shor's and Grover's Algorithms",funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'sdn wan solutions',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'sd wan software defined wan',funnel:'TOFU',sv:20,prev:'4',cur:1},
=======
  {kw:'how firewall works in network',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'firewall transparent mode',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'firewall security price in usa',funnel:'BOFU',sv:20,prev:'2',cur:1},
  {kw:'difference between application level firewall and network level firewall',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'add a next generation firewall',funnel:'BOFU',sv:20,prev:'3',cur:1},
  {kw:'price of hardware firewall',funnel:'BOFU',sv:20,prev:'1',cur:1},
  {kw:"Shor's and Grover's Algorithms",funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'Quantum-Risk Assessment',funnel:'MOFU',sv:20,prev:'1',cur:1},
  {kw:'wan sdn',funnel:'TOFU',sv:20,prev:'3',cur:1},
  {kw:'sdn wan solutions',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'sd-wan aggregation',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'sd wan features comparison',funnel:'TOFU',sv:20,prev:'1',cur:1},
  {kw:'top ai cybersecurity vendors',funnel:'BOFU',sv:10,prev:'1',cur:1},
  {kw:'acl access control lists',funnel:'TOFU',sv:10,prev:'1',cur:1},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  {kw:'physical firewall prices',funnel:'BOFU',sv:10,prev:'1',cur:1},
  {kw:'Quantum-Safe Security',funnel:'TOFU',sv:10,prev:'1',cur:1},
  {kw:'how ai security works',funnel:'TOFU',sv:0,prev:'1',cur:1},
  {kw:'ai cybersecurity applications',funnel:'MOFU',sv:0,prev:'1',cur:1},
<<<<<<< HEAD
  {kw:'what is quatum security',funnel:'TOFU',sv:0,prev:'1',cur:1},
];

const POS_CATS = ['All','NGFW','SD-WAN','NAC','Zero Trust','Top Opportunities','AI Cybersecurity','OT Security','Quantum Security','SASE'];
const VOL_CAT: Record<string,string> = {'sd wan features comparison':'SD-WAN','top sd wan providers':'SD-WAN','ics/ot':'OT Security','phishing email':'Top Opportunities','deepfake ai best practices':'AI Cybersecurity','access control technologies':'NAC','next generation application firewall':'NGFW','phishing definition':'Top Opportunities','sd wan vendors':'SD-WAN','sd wan visibility':'SD-WAN','network access control technologies':'NAC','nac security solution':'NAC'};
const WOW_ROWS = Object.entries(CAT_KEYWORDS)
  .filter(([c])=>POS_CATS.includes(c))
  .flatMap(([c,l])=>l.map(k=>({keyword:k.keyword,category:c,vol:k.vol_jan26,prev:(k.ranks[39]??101) as number,cur:(k.ranks[40]??101) as number})));
const POS_GAIN = WOW_ROWS.filter(r=>r.cur<r.prev&&r.prev<=100).sort((a,b)=>(b.prev-b.cur)-(a.prev-a.cur)||b.vol-a.vol);
const POS_LOSS = WOW_ROWS.filter(r=>r.cur>r.prev&&r.cur<=100).sort((a,b)=>(b.cur-b.prev)-(a.cur-a.prev)||b.vol-a.vol);

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [posCat, setPosCat] = useState<string>('All');
  const [selectedCat, setSelectedCat] = useState<string>('NGFW');
  const [selectedFunnel, setSelectedFunnel] = useState<'All'|'TOFU'|'MOFU'|'BOFU'>('All');
  const [selectedRankFilter, setSelectedRankFilter] = useState<'All'|'Rank1'|'Page1'|'Page2_10'|'NotRanking'|'Funnel'>('All');
=======
  {kw:'which are the top ai security companies',funnel:'BOFU',sv:0,prev:'6',cur:1},
  {kw:'what is quatum security',funnel:'TOFU',sv:0,prev:'1',cur:1},
];
const AIO_KEYWORDS:KwRow[] = uniqKw(AIO_KEYWORDS_RAW);

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('traffic');
  const [selectedCat, setSelectedCat] = useState<string>('NGFW');
  const [selectedFunnel, setSelectedFunnel] = useState<'All'|'TOFU'|'MOFU'|'BOFU'>('All');
  const [selectedRankFilter, setSelectedRankFilter] = useState<'All'|'Rank1'|'Page1'|'NotRanking'|'Funnel'>('All');
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  const [selectedBlFunnel, setSelectedBlFunnel] = useState<'TOFU'|'MOFU'|'BOFU'>('TOFU');
  const [posInited, setPosInited] = useState(false);
  const [trafficInited, setTrafficInited] = useState(false);
  const [modal1100, setModal1100] = useState(false);
  const [modalNR, setModalNR] = useState(false);
  const [modalAIO, setModalAIO] = useState(false);

  const chartsRef = useRef<Record<string, Chart>>({});

  function makeChart(id: string, cfg: object) {
    if(chartsRef.current[id]) { chartsRef.current[id].destroy(); }
    const ctx = document.getElementById(id) as HTMLCanvasElement | null;
    if(!ctx) return;
    Chart.defaults.color = '#64748B';
    (Chart.defaults as any).borderColor = '#E2E8F0';
    chartsRef.current[id] = new Chart(ctx, cfg as any);
  }

  // Overview charts
  useEffect(() => {
    setTimeout(() => {
      // Weekly R1 Line — 9 categories, 31 weeks
      makeChart('weeklyR1Chart', {
        type:'line',
        data:{
          labels:WEEKS,
          datasets:[
            ...['NGFW','SD-WAN','NAC','Zero Trust','Top Opportunities'].map(cat=>({
              label:cat, data:WEEKLY_PAGE1[cat], borderColor:catColor(cat),
              backgroundColor:'transparent', borderWidth:2.5, pointRadius:2.5, pointHoverRadius:6, tension:.35
            })),
            ...['AI Cybersecurity','OT Security','Quantum Security','SASE'].map(cat=>({
              label:cat, data:WEEKLY_PAGE1[cat], borderColor:catColor(cat),
              backgroundColor:'transparent', borderWidth:2, pointRadius:2, pointHoverRadius:5, tension:.35, borderDash:[5,3]
            }))
          ]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{position:'top',labels:{font:{size:10,weight:'600'},boxWidth:10,color:'#334155',padding:8}}},
          scales:{
            x:{grid:{color:'#F1F5F9'},ticks:{font:{size:9},maxRotation:30,color:'#64748B'}},
            y:{grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#64748B'},title:{display:true,text:'# at Page 1 (Rank 1–10)',font:{size:10},color:'#64748B'}}
          }
        }
      });

      // Weekly Average Position Line Chart — 9 categories
      makeChart('avgRankChart', {
        type:'line',
        data:{
          labels:WEEKS,
          datasets:[
            ...['NGFW','SD-WAN','NAC','Zero Trust','Top Opportunities'].map(cat=>({
              label:cat, data:WEEKLY_AVG_RANK[cat], borderColor:catColor(cat),
              backgroundColor:'transparent', borderWidth:2.5, pointRadius:2, pointHoverRadius:6, tension:.35, spanGaps:true
            })),
            ...['AI Cybersecurity','OT Security','Quantum Security','SASE'].map(cat=>({
              label:cat, data:WEEKLY_AVG_RANK[cat], borderColor:catColor(cat),
              backgroundColor:'transparent', borderWidth:2, pointRadius:2, pointHoverRadius:5, tension:.35, borderDash:[5,3], spanGaps:true
            }))
          ]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{position:'top',labels:{font:{size:9,weight:'600'},boxWidth:9,color:'#334155',padding:8}}},
          scales:{
            x:{grid:{color:'#F1F5F9'},ticks:{font:{size:9},maxRotation:30,color:'#64748B'}},
            y:{reverse:true,min:1,grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#64748B'},title:{display:true,text:'Avg Position (lower = better)',font:{size:10},color:'#64748B'}}
          }
        }
      });

<<<<<<< HEAD
      // Trend Line — 41 weeks (Oct 07)
=======
      // Trend Line — 40 weeks (Sep 30)
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
      makeChart('trendLine', {
        type:'line',
        data:{
          labels:WEEKS,
          datasets:[
<<<<<<< HEAD
            {label:'vpn (673K)',data:[41,29,31,33,20,17,25,16,24,null,29,10,17,1,1,1,1,1,17,1,1,1,1,11,1,8,7,8,1,7,8,20,1,13,1,14,19,14,13,12,1],borderColor:'#D93025',backgroundColor:'transparent',borderWidth:2.5,pointRadius:2,tension:.35,spanGaps:true},
            {label:'cybersecurity (201K)',data:[7,8,9,9,8,1,23,10,9,19,8,19,8,1,1,23,1,17,1,11,36,16,9,null,5,7,9,1,1,1,36,1,31,null,1,1,null,1,1,null,null],borderColor:'#1A56DB',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.35,spanGaps:true},
            {label:'proxy (201K)',data:[5,4,5,20,10,7,4,1,9,11,1,7,7,1,9,6,8,20,1,6,6,1,4,5,4,1,11,6,8,6,6,3,5,3,6,3,2,2,3,21,2],borderColor:'#0E7490',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.35},
            {label:'what is malware (135K)',data:[3,1,6,6,1,4,6,1,1,1,8,4,5,5,6,18,14,16,13,16,18,15,1,20,20,18,18,20,null,21,23,1,20,26,32,null,21,19,25,23,20],borderColor:'#7C3AED',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.35},
            {label:'what is phishing (74K)',data:[1,4,4,7,11,8,6,1,9,1,3,1,6,5,1,1,1,1,8,1,1,1,null,1,1,10,1,8,1,10,8,21,10,8,1,8,14,1,9,7,null],borderColor:'#0A7A55',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.35,spanGaps:true},
            {label:'phishing (49.5K)',data:[12,16,17,13,16,16,12,19,5,1,16,26,10,1,6,1,1,1,1,1,1,48,1,1,1,1,1,49,27,57,19,20,26,29,28,24,25,50,67,26,null],borderColor:'#059669',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,tension:.35,borderDash:[4,2]},
            {label:'ips (49.5K)',data:[26,19,18,16,15,17,1,1,1,1,1,18,14,1,1,23,1,1,1,1,21,null,21,21,1,9,13,12,12,7,9,13,10,1,35,7,6,22,15,21,12],borderColor:'#DC2626',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,tension:.35,borderDash:[4,2],spanGaps:true},
            {label:'ddos (33.1K)',data:[4,4,4,4,1,5,4,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,6,1,1,1,1,1,1,5,1,1,1,7,1,8,1,1,1],borderColor:'#2563EB',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,tension:.35,borderDash:[4,2]},
            {label:'ransomware (33.1K)',data:[4,3,4,1,1,4,4,4,6,5,5,4,4,1,1,1,1,1,1,1,4,5,5,7,1,6,1,6,6,4,8,7,7,5,1,6,6,9,1,6,null],borderColor:'#9333EA',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,tension:.35,borderDash:[4,2]}
=======
            {label:'vpn (673K)',data:[41,29,31,33,20,17,25,16,24,null,29,10,17,1,1,1,1,1,17,1,1,1,1,11,1,8,7,8,1,7,8,20,1,13,1,14,19,14,13,12],borderColor:'#D93025',backgroundColor:'transparent',borderWidth:2.5,pointRadius:2,tension:.35,spanGaps:true},
            {label:'cybersecurity (201K)',data:[7,8,9,9,8,1,23,10,9,19,8,19,8,1,1,23,1,17,1,11,36,16,9,null,5,7,9,1,1,1,36,1,31,null,1,1,null,1,1,null],borderColor:'#1A56DB',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.35,spanGaps:true},
            {label:'proxy (201K)',data:[5,4,5,20,10,7,4,1,9,11,1,7,7,1,9,6,8,20,1,6,6,1,4,5,4,1,11,6,8,6,6,3,5,3,6,3,2,2,3,21],borderColor:'#0E7490',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.35},
            {label:'what is malware (135K)',data:[3,1,6,6,1,4,6,1,1,1,8,4,5,5,6,18,14,16,13,16,18,15,1,20,20,18,18,20,null,21,23,1,20,26,32,null,21,19,25,23],borderColor:'#7C3AED',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.35},
            {label:'what is phishing (74K)',data:[1,4,4,7,11,8,6,1,9,1,3,1,6,5,1,1,1,1,8,1,1,1,null,1,1,10,1,8,1,10,8,21,10,8,1,8,14,1,9,7],borderColor:'#0A7A55',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.35,spanGaps:true},
            {label:'phishing (49.5K)',data:[12,16,17,13,16,16,12,19,5,1,16,26,10,1,6,1,1,1,1,1,1,48,1,1,1,1,1,49,27,57,19,20,26,29,28,24,25,50,67,26],borderColor:'#059669',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,tension:.35,borderDash:[4,2]},
            {label:'ips (49.5K)',data:[26,19,18,16,15,17,1,1,1,1,1,18,14,1,1,23,1,1,1,1,21,null,21,21,1,9,13,12,12,7,9,13,10,1,35,7,6,22,15,21],borderColor:'#DC2626',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,tension:.35,borderDash:[4,2],spanGaps:true},
            {label:'ddos (33.1K)',data:[4,4,4,4,1,5,4,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,6,1,1,1,1,1,1,5,1,1,1,7,1,8,1,1],borderColor:'#2563EB',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,tension:.35,borderDash:[4,2]},
            {label:'ransomware (33.1K)',data:[4,3,4,1,1,4,4,4,6,5,5,4,4,1,1,1,1,1,1,1,4,5,5,7,1,6,1,6,6,4,8,7,7,5,1,6,6,9,1,6],borderColor:'#9333EA',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,tension:.35,borderDash:[4,2]}
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
          ]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{position:'top',labels:{font:{size:10,weight:'600'},boxWidth:12,color:'#334155',padding:8}}},
          scales:{
            x:{grid:{color:'#F1F5F9'},ticks:{font:{size:9},maxRotation:30,color:'#64748B'}},
            y:{reverse:true,min:1,max:60,grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#64748B'},title:{display:true,text:'Position (1 = Best)',font:{size:10},color:'#64748B'}}
          }
        }
      });

<<<<<<< HEAD
      // WoW Sentiment Distribution — Sep 30→Oct 07 · from 9_Category_With_AIO.csv
=======
      // WoW Sentiment Distribution — Sep 23→Sep 30 · from FORT_Week_Over_Week…__5_.csv
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
      makeChart('wowDistChart', {
        type:'bar',
        data:{
          labels:['↑20+','↑10-20','↑5-10','↑1-5','Stable','↓1-5','↓5-10','↓10-20','↓20+'],
          datasets:[{
            label:'Keywords',
            data:WOW_DIST,
            backgroundColor:['#0A7A55','#059669','#10B981','#6EE7B7','#CBD5E1','#FCA5A5','#F87171','#EF4444','#DC2626'],
            borderRadius:5,borderSkipped:false
          }]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{display:false}},
          scales:{
            x:{grid:{display:false},ticks:{font:{size:9},maxRotation:30,color:'#64748B'}},
            y:{grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#64748B'}}
          }
        }
      });

<<<<<<< HEAD
      // Net WoW per category — Sep 30 → Oct 07 (week-over-week)
=======
      // Net WoW per category — Sep 23 → Sep 30 (week-over-week)
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
      const wowCats = ['NGFW','SD-WAN','NAC','Zero Trust','Top Opportunities','AI Cybersecurity','OT Security','Quantum Security','SASE'];
      const wowLabels = ['NGFW','SD-WAN','NAC','Zero Trust','Top Opps','AI Cyber','OT Sec','Quantum','SASE'];
      makeChart('netWowChart', {
        type:'bar',
        data:{
          labels:wowLabels,
          datasets:[
            {label:'↑ Gaining (WoW)',data:wowCats.map(c=>WOW_STATS[c]?.improving||0),backgroundColor:'rgba(10,122,85,.65)',borderRadius:5,borderSkipped:false},
            {label:'→ Stable',data:wowCats.map(c=>WOW_STATS[c]?.stable||0),backgroundColor:'rgba(203,213,225,.7)',borderRadius:5,borderSkipped:false},
            {label:'↓ Losing (WoW)',data:wowCats.map(c=>WOW_STATS[c]?.declining||0),backgroundColor:'rgba(217,48,37,.55)',borderRadius:5,borderSkipped:false}
          ]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{
            legend:{position:'top',labels:{font:{size:11,weight:'600'},boxWidth:12,color:'#334155',padding:12}},
<<<<<<< HEAD
            tooltip:{callbacks:{title:(items:any)=>`${items[0].label} · Sep 30 → Oct 07`}}
=======
            tooltip:{callbacks:{title:(items:any)=>`${items[0].label} · Sep 23 → Sep 30`}}
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
          },
          scales:{
            x:{stacked:true,grid:{display:false},ticks:{font:{size:10},color:'#64748B'}},
            y:{stacked:true,grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#64748B'}}
          }
        }
      });

<<<<<<< HEAD

      {
        const all9 = ['NGFW','SD-WAN','NAC','Zero Trust','Top Opportunities','AI Cybersecurity','OT Security','Quantum Security','SASE'];
        const cc = [...all9].sort((a,b)=>CAT_STATS[b].total-CAT_STATS[a].total);
        const ca = [...all9].sort((a,b)=>CAT_STATS[a].avg_rank-CAT_STATS[b].avg_rank);
        const lab = {id:'valueLabels',afterDatasetsDraw(ch:any){const c=ch.ctx;c.save();c.font='800 12px DM Sans';c.fillStyle='#0B1220';c.textAlign='center';ch.data.datasets.forEach((d:any,i:number)=>{ch.getDatasetMeta(i).data.forEach((b:any,j:number)=>{c.fillText(String(d.data[j]),b.x,b.y-6);});});c.restore();}};
        const opt = (title:string,extra:object={})=>({responsive:true,maintainAspectRatio:false,layout:{padding:{top:20}},plugins:{legend:{position:'top',labels:{font:{size:13,weight:'700'},color:'#0B1220',boxWidth:14}}},scales:{x:{grid:{display:false},ticks:{font:{size:12,weight:'700'},color:'#0B1220',maxRotation:40}},y:{beginAtZero:true,grid:{color:'#E2E8F0'},ticks:{font:{size:12,weight:'700'},color:'#334155'},title:{display:true,text:title,font:{size:12,weight:'700'}},...extra}}});
        makeChart('catTotalsChart',{type:'bar',plugins:[lab],data:{labels:cc,datasets:[
          {label:'Total KWs',data:cc.map(c=>CAT_STATS[c].total),backgroundColor:'#1A56DB',borderRadius:5},
          {label:'Page 1',data:cc.map(c=>CAT_STATS[c].valid),backgroundColor:'#0A7A55',borderRadius:5},
          {label:'NR (Not Ranking)',data:cc.map(c=>CAT_STATS[c].not_ranking),backgroundColor:'#D93025',borderRadius:5}]},options:opt('Keywords')});
        makeChart('catAvgChart',{type:'bar',plugins:[lab],data:{labels:ca,datasets:[
          {label:'Avg Position',data:ca.map(c=>CAT_STATS[c].avg_rank),backgroundColor:ca.map(c=>catColor(c)),borderRadius:5}]},options:{...opt('Avg Position'),plugins:{legend:{display:false}}}});
      }

      // Cat bar — 9 categories Oct 07
=======
      // Cat bar — 9 categories Sep 30
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
      makeChart('catBarChart', {
        type:'bar',
        data:{
          labels:['NGFW','SD-WAN','NAC','ZeroTrust','TopOpps','AI Cyber','OT Sec','Quantum','SASE'],
          datasets:[
<<<<<<< HEAD
            {label:'Page 1',data:[121,89,50,9,17,47,32,13,15],backgroundColor:'rgba(10,122,85,.75)',borderRadius:5,borderSkipped:false},
=======
            {label:'Page 1',data:[130,97,73,17,26,62,37,18,27],backgroundColor:'rgba(10,122,85,.75)',borderRadius:5,borderSkipped:false},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            {label:'Total',data:[141,130,80,20,49,136,46,28,30],backgroundColor:'rgba(10,122,85,.18)',borderRadius:5,borderSkipped:false}
          ]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{position:'top',labels:{font:{size:11,weight:'600'},boxWidth:12,color:'#334155',padding:12}}},
          scales:{
            x:{grid:{display:false},ticks:{font:{size:9},color:'#64748B'}},
            y:{grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#64748B'}}
          }
        }
      });
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPositionCharts = useCallback(() => {
    // Vol-weighted Page 1 (rank 1-10) capture rate per category — computed from full CSV Aug 12
    const catLabels = ['NGFW','SASE','SD-WAN','NAC','Zero Trust','OT Sec','Top Opps','Quantum','AI Cyber'];
    const catColors = [
      'rgba(10,122,85,.70)',
      'rgba(6,182,212,.70)',
      'rgba(180,83,9,.70)',
      'rgba(26,86,219,.70)',
      'rgba(124,58,237,.70)',
      'rgba(99,102,241,.70)',
      'rgba(217,48,37,.70)',
      'rgba(236,72,153,.70)',
      'rgba(245,158,11,.70)',
    ];
<<<<<<< HEAD
    // Pre-computed: page1Vol / totalVol × 100 per category (all keywords, Oct 07)
    const velScores = [93.8, 99.9, 92.5, 80.2, 79.0, 93.9, 56.9, 6.3, 50.9]; // Oct 07
=======
    // Pre-computed: page1Vol / totalVol × 100 per category (all keywords, Sep 30)
    const velScores = [93.7, 69.1, 42.9, 89, 58.4, 94.7, 21.1, 8.4, 45]; // Sep 30
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611

    const velCtx = document.getElementById('velocityChart') as HTMLCanvasElement | null;
    if (!velCtx) return;
    if (chartsRef.current['velocityChart']) chartsRef.current['velocityChart'].destroy();
    chartsRef.current['velocityChart'] = new Chart(velCtx, {
      type: 'bar',
      data: {
        labels: catLabels,
        datasets: [{
          label: '% Vol at Page 1',
          data: velScores,
          backgroundColor: catColors,
          borderRadius: 7,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.parsed.x}% of tracked vol at Page 1 (rank 1–10)`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: '#F1F5F9' },
            ticks: { color: '#64748B', font: { size: 11 }, callback: (v: any) => `${v}%` },
            max: 100,
          },
          y: {
            grid: { display: false },
            ticks: { color: '#334155', font: { size: 12, weight: '600' } },
          },
        },
      },
    } as any);

    // Force a resize so the chart fills its container correctly
    setTimeout(() => {
      chartsRef.current['velocityChart']?.resize();
    }, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

<<<<<<< HEAD
  function openFromHome(tab: string, cat?: string) {
    if(cat) setSelectedCat(cat);
    handleTabSwitch(tab);
  }

  function handleTabSwitch(id: string) {
    setActiveTab(id);
    window.scrollTo({top:0,behavior:'smooth'});
=======
  function handleTabSwitch(id: string) {
    setActiveTab(id);
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
    if(id === 'position' && !posInited) {
      setPosInited(true);
      setTimeout(() => { renderPositionCharts(); window.dispatchEvent(new Event('resize')); }, 100);
    }
    if(id === 'traffic' && !trafficInited) {
      setTrafficInited(true);
      setTimeout(() => { renderTrafficCharts(); window.dispatchEvent(new Event('resize')); }, 100);
    }
    // Trigger chart resize after tab becomes visible
    setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
  }

  const renderTrafficCharts = useCallback(() => {
    // GSC — Organic search traffic trend (area + lines)
    makeChart('trafficOrgChart', {
      type:'line',
      data:{
        labels: TRAFFIC_WEEKS,
        datasets:[
          {label:'All Organic',data:TRAFFIC_DATA.allOrganic,borderColor:'#1A56DB',backgroundColor:'rgba(26,86,219,.07)',borderWidth:2.5,pointRadius:2.5,pointHoverRadius:6,tension:.38,fill:true},
          {label:'Branded',data:TRAFFIC_DATA.branded,borderColor:'#7C3AED',backgroundColor:'transparent',borderWidth:2,pointRadius:2,pointHoverRadius:5,tension:.38,borderDash:[5,3]},
          {label:'Non-Branded',data:TRAFFIC_DATA.nonBranded,borderColor:'#0A7A55',backgroundColor:'transparent',borderWidth:2,pointRadius:2,pointHoverRadius:5,tension:.38},
        ]
      },
      options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'top',labels:{font:{size:10,weight:'600'},boxWidth:10,color:'#334155',padding:10}},tooltip:{callbacks:{label:(ctx:any)=>`${ctx.dataset.label}: ${Number(ctx.raw)?.toLocaleString()}`}}},scales:{x:{grid:{color:'#F1F5F9'},ticks:{font:{size:9},maxRotation:30,color:'#64748B'}},y:{grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#64748B',callback:(v:any)=>v>=1000?`${(v/1000).toFixed(0)}K`:v},title:{display:true,text:'Weekly Sessions (GSC)',font:{size:10},color:'#64748B'}}}}
    });

    // GA — Page-level traffic 33-week line
    makeChart('trafficPageChart', {
      type:'line',
      data:{
        labels: TRAFFIC_WEEKS,
        datasets:[
          {label:'/cyberglossary',data:TRAFFIC_DATA.cyberglossary,borderColor:'#D93025',backgroundColor:'transparent',borderWidth:2.5,pointRadius:2,pointHoverRadius:6,tension:.38},
          {label:'/products',data:TRAFFIC_DATA.products,borderColor:'#B45309',backgroundColor:'transparent',borderWidth:2,pointRadius:2,pointHoverRadius:5,tension:.38},
          {label:'/home page',data:TRAFFIC_DATA.homePage,borderColor:'#0E7490',backgroundColor:'transparent',borderWidth:2,pointRadius:2,pointHoverRadius:5,tension:.38},
          {label:'/blog',data:TRAFFIC_DATA.blog,borderColor:'#059669',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,pointHoverRadius:5,tension:.38,borderDash:[4,2]},
          {label:'/solutions',data:TRAFFIC_DATA.solutions,borderColor:'#7C3AED',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,pointHoverRadius:5,tension:.38,borderDash:[4,2]},
          {label:'/about-us',data:TRAFFIC_DATA.aboutUs,borderColor:'#EC4899',backgroundColor:'transparent',borderWidth:1.5,pointRadius:2,pointHoverRadius:5,tension:.38,borderDash:[4,2]},
        ]
      },
      options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'top',labels:{font:{size:10,weight:'600'},boxWidth:10,color:'#334155',padding:8}},tooltip:{callbacks:{label:(ctx:any)=>`${ctx.dataset.label}: ${Number(ctx.raw)?.toLocaleString()}`}}},scales:{x:{grid:{color:'#F1F5F9'},ticks:{font:{size:9},maxRotation:45,autoSkip:false,color:'#64748B',callback:(val:any,idx:number)=>(idx===35||idx%4===0)?val:''}},y:{grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#64748B',callback:(v:any)=>v>=1000?`${(v/1000).toFixed(0)}K`:v},title:{display:true,text:'Weekly Sessions (GA)',font:{size:10},color:'#64748B'}}}}
    });

    // GA — Direct traffic comparison: Direct vs Direct (Valid)
    makeChart('trafficDirectChart', {
      type:'line',
      data:{
        labels: TRAFFIC_WEEKS,
        datasets:[
          {label:'Direct (All)',data:TRAFFIC_DATA.directGA,borderColor:'#7C3AED',backgroundColor:'rgba(124,58,237,.07)',borderWidth:2.5,pointRadius:2.5,pointHoverRadius:6,tension:.38,fill:true},
          {label:'Direct (Valid — excl. email/live-chat/Nexus)',data:TRAFFIC_DATA.directValid,borderColor:'#F59E0B',backgroundColor:'transparent',borderWidth:2,pointRadius:2,pointHoverRadius:5,tension:.38,borderDash:[5,3]},
          {label:'Direct (Valid — excl. Downloads)',data:TRAFFIC_DATA.directDownloads,borderColor:'#0E7490',backgroundColor:'transparent',borderWidth:2,pointRadius:2,pointHoverRadius:5,tension:.38,borderDash:[3,4]},
        ]
      },
      options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'top',labels:{font:{size:10,weight:'600'},boxWidth:10,color:'#334155',padding:10}},tooltip:{callbacks:{label:(ctx:any)=>`${ctx.dataset.label}: ${Number(ctx.raw)?.toLocaleString()}`}}},scales:{x:{grid:{color:'#F1F5F9'},ticks:{font:{size:9},maxRotation:30,color:'#64748B'}},y:{grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#64748B',callback:(v:any)=>v>=1000?`${(v/1000).toFixed(0)}K`:v},title:{display:true,text:'Weekly Sessions (GA)',font:{size:10},color:'#64748B'}}}}
    });

<<<<<<< HEAD
    // GA — Horizontal bar: page sessions Sep 30 vs Oct 7
=======
    // GA — Horizontal bar: page sessions Sep 23 vs Sep 30
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
    makeChart('trafficPageBarChart', {
      type:'bar',
      data:{
        labels:['/cyberglossary','/products','/home page','/blog','/solutions','/about-us','/articles'],
        datasets:[
<<<<<<< HEAD
          {label:'Sep 30',data:[TRAFFIC_DATA.cyberglossary[39],TRAFFIC_DATA.products[39],TRAFFIC_DATA.homePage[39],TRAFFIC_DATA.blog[39],TRAFFIC_DATA.solutions[39],TRAFFIC_DATA.aboutUs[39],TRAFFIC_DATA.articles[39]],backgroundColor:'rgba(100,116,139,.4)',borderRadius:3,borderSkipped:false},
          {label:'Oct 7',data:[TRAFFIC_DATA.cyberglossary[40],TRAFFIC_DATA.products[40],TRAFFIC_DATA.homePage[40],TRAFFIC_DATA.blog[40],TRAFFIC_DATA.solutions[40],TRAFFIC_DATA.aboutUs[40],TRAFFIC_DATA.articles[40]],backgroundColor:['rgba(217,48,37,.75)','rgba(180,83,9,.75)','rgba(14,116,144,.75)','rgba(5,150,105,.75)','rgba(124,58,237,.75)','rgba(236,72,153,.75)','rgba(100,116,139,.75)'],borderRadius:3,borderSkipped:false},
=======
          {label:'Sep 23',data:[TRAFFIC_DATA.cyberglossary[38],TRAFFIC_DATA.products[38],TRAFFIC_DATA.homePage[38],TRAFFIC_DATA.blog[38],TRAFFIC_DATA.solutions[38],TRAFFIC_DATA.aboutUs[38],TRAFFIC_DATA.articles[38]],backgroundColor:'rgba(100,116,139,.4)',borderRadius:3,borderSkipped:false},
          {label:'Sep 30',data:[TRAFFIC_DATA.cyberglossary[39],TRAFFIC_DATA.products[39],TRAFFIC_DATA.homePage[39],TRAFFIC_DATA.blog[39],TRAFFIC_DATA.solutions[39],TRAFFIC_DATA.aboutUs[39],TRAFFIC_DATA.articles[39]],backgroundColor:['rgba(217,48,37,.75)','rgba(180,83,9,.75)','rgba(14,116,144,.75)','rgba(5,150,105,.75)','rgba(124,58,237,.75)','rgba(236,72,153,.75)','rgba(100,116,139,.75)'],borderRadius:3,borderSkipped:false},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
        ]
      },
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'top',labels:{font:{size:10,weight:'600'},boxWidth:10,color:'#334155',padding:8}},tooltip:{callbacks:{label:(ctx:any)=>`${ctx.dataset.label}: ${Number(ctx.raw)?.toLocaleString()}`}}},scales:{x:{grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#64748B',callback:(v:any)=>v>=1000?`${(v/1000).toFixed(0)}K`:v}},y:{grid:{display:false},ticks:{font:{size:10,weight:'600'},color:'#334155'}}}}
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Solid R1 list — keywords at #1 for most of 34 weeks

  const volWeightedCats = [
<<<<<<< HEAD
    {name:'NGFW',score:32.7,color:'var(--green)'},
    {name:'SD-WAN',score:44.8,color:'var(--amber)'},
    {name:'NAC',score:26.2,color:'var(--blue)'},
    {name:'Zero Trust',score:9.6,color:'var(--purple)'},
    {name:'Top Opps',score:15.6,color:'var(--red)'}
=======
    {name:'NGFW',score:99.6,color:'var(--green)'},
    {name:'SD-WAN',score:94.9,color:'var(--amber)'},
    {name:'NAC',score:86.1,color:'var(--blue)'},
    {name:'Zero Trust',score:76.9,color:'var(--purple)'},
    {name:'Top Opps',score:65.1,color:'var(--red)'}
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  ];

  const scorecardStatuses: Record<string,{label:string;color:string}> = {
    'NGFW':{label:'⚠ Softening',color:'var(--amber)'},
<<<<<<< HEAD
    'SD-WAN':{label:'⚠ Softening',color:'var(--amber)'},
    'NAC':{label:'⚠ Declining',color:'var(--red)'},
    'Zero Trust':{label:'⚠ Declining',color:'var(--red)'},
    'Top Opportunities':{label:'⚠ Declining',color:'var(--red)'},
    'AI Cybersecurity':{label:'🆕 New',color:'#F59E0B'},
    'OT Security':{label:'✅ Stable',color:'var(--green)'},
    'Quantum Security':{label:'🆕 New',color:'#EC4899'},
    'SASE':{label:'🆕 New · 50% P1',color:'#06B6D4'}
=======
    'SD-WAN':{label:'⚠ Declining',color:'var(--red)'},
    'NAC':{label:'⚠ Declining',color:'var(--red)'},
    'Zero Trust':{label:'✅ Strong',color:'var(--green)'},
    'Top Opportunities':{label:'⚠ Declining',color:'var(--red)'},
    'AI Cybersecurity':{label:'🆕 New',color:'#F59E0B'},
    'OT Security':{label:'🆕 New',color:'#6366F1'},
    'Quantum Security':{label:'🆕 New',color:'#EC4899'},
    'SASE':{label:'🆕 New · 90% P1',color:'#06B6D4'}
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  };

  function buildCatTableHtml(kws: KW[]): string {
    function sparklineSvg(ranks: (number|null)[]): string {
      const W = 120, H = 28, NR = 101;
      const mapped = ranks.map(r => (r === null || r === undefined) ? NR : r);
      const anyRanked = mapped.some(r => r < NR);
      if (!anyRanked) return `<svg width="${W}" height="${H}"></svg>`;
      const maxR = Math.max(...mapped);
      const pts: string[] = [];
      mapped.forEach((r, i) => {
        const x = (i / (mapped.length - 1)) * (W - 4) + 2;
        const y = ((r - 1) / (maxR - 1)) * (H - 4) + 2;
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      });
      return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><polyline points="${pts.join(' ')}" fill="none" stroke="#1E293B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    function cellStyle(r: number | null): string {
      if (r === null || r === undefined) return 'text-align:center;color:#94A3B8;font-size:11px;font-family:\'DM Mono\',monospace;font-weight:600';
      const bg = rankColor(r);
      const col = rankTextColor(r);
      return `text-align:center;background:${bg};color:${col};font-weight:700;font-size:12px;font-family:'DM Mono',monospace`;
    }
    return `<table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr style="border-bottom:2px solid #E2E8F0">
        <th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;min-width:180px">Keyword</th>
        <th style="text-align:right;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Vol<br/><span style="font-weight:500;font-size:9px">Search</span></th>
        <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Baseline<br/><span style="font-weight:500;font-size:9px">Dec 31</span></th>
<<<<<<< HEAD
        <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Sep 30<br/><span style="font-weight:500;font-size:9px">Prev Week</span></th>
        <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#1A56DB;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Oct 07<br/><span style="font-weight:500;font-size:9px">Latest</span></th>
        <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Δ WoW<br/><span style="font-weight:500;font-size:9px">WoW Sep 30 → Oct 07</span></th>
        <th style="text-align:center;padding:8px 16px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">41-Week Trend<br/><span style="font-weight:500;font-size:9px">Dec → Oct 07</span></th>
=======
        <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Sep 23<br/><span style="font-weight:500;font-size:9px">Prev Week</span></th>
        <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#1A56DB;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Sep 30<br/><span style="font-weight:500;font-size:9px">Latest</span></th>
        <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Δ WoW<br/><span style="font-weight:500;font-size:9px">WoW Sep 23 → Sep 30</span></th>
        <th style="text-align:center;padding:8px 16px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">40-Week Trend<br/><span style="font-weight:500;font-size:9px">Dec → Sep 30</span></th>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
      </tr></thead>
      <tbody>
      ${kws.map((d,i) => {
        const dec31 = d.ranks[0];
<<<<<<< HEAD
        const aug12 = d.ranks[39] ?? null;  // Sep 30 (prev week)
        const aug19 = d.ranks[40] ?? d.current_rank;  // Oct 07 (latest)
=======
        const aug12 = d.ranks[38] ?? null;  // Sep 23 (prev week)
        const aug19 = d.ranks[39] ?? d.current_rank;  // Sep 30 (latest)
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
        const chg = (aug19 !== null && aug12 !== null) ? (aug19 - aug12) : null;
        const chgColor = chg === null ? '#64748B' : chg < 0 ? '#0A7A55' : chg > 0 ? '#D93025' : '#64748B';
        const chgLabel = chg === null ? '—' : chg < 0 ? `↑${Math.abs(chg)}` : chg > 0 ? `↓${chg}` : '—';
        const vol = d.vol_jan26 >= 1000 ? `${(d.vol_jan26/1000).toFixed(d.vol_jan26>=10000?0:1)}K` : d.vol_jan26 > 0 ? String(d.vol_jan26) : '—';
        return `<tr style="border-bottom:1px solid #F1F5F9;background:${i%2===0?'#ffffff':'#FAFBFC'}">
          <td style="padding:7px 12px;font-weight:700;color:#0F172A;white-space:nowrap">${d.keyword}</td>
          <td style="padding:7px 12px;text-align:right;font-size:11px;font-family:'DM Mono',monospace;font-weight:600;color:#64748B;white-space:nowrap">${vol}</td>
          <td style="${cellStyle(dec31)};padding:7px 12px">${dec31??101}</td>
          <td style="${cellStyle(aug12)};padding:7px 12px">${aug12??101}</td>
          <td style="${cellStyle(aug19)};padding:7px 12px;border:1.5px solid rgba(26,86,219,.25)">${aug19??101}</td>
          <td style="text-align:center;padding:7px 12px;font-weight:700;font-size:12px;font-family:'DM Mono',monospace;color:${chgColor}">${chgLabel}</td>
          <td style="padding:5px 16px;text-align:center">${sparklineSvg(d.ranks)}</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>`;
  }

<<<<<<< HEAD
  const B = (t:string|number)=><strong>{t}</strong>;
  const tf = (k:keyof typeof TRAFFIC_DATA)=>{const v=TRAFFIC_DATA[k][40];return v>=100000?Math.round(v/1000)+'K':v>=1000?(v/1000).toFixed(1)+'K':String(v);};
  const sg = (n:number)=>`${n>=0?'+':'−'}${Math.abs(n).toLocaleString()}`;
  const sp = (n:number)=>`${n>=0?'+':'−'}${Math.abs(n).toFixed(2)}%`;

  const overviewInsights: InsightItem[] = [
    {tone:'amber',title:'Page 1 slipped this week',body:<>{B('464 of 660')} tracked keywords rank on Page 1 (70.3%), down {B(23)} from 487 last week. Rank #1 held steady at {B(315)} ({B('−3')} WoW).</>},
    {tone:'red',title:'Not Ranking increased',body:<>{B(121)} keywords are not ranking, {B('+36')} vs 85 last week. {B('AI Cybersecurity')} holds {B(59)} of them (49%), the main driver of the loss.</>},
    {tone:'blue',title:'Room to grow',body:<>{B(75)} keywords sit on Pages 2–10 (ranks 11–100), down from 88. They are the nearest-term opportunity to push onto Page 1.</>},
  ];
  const tvR1 = TOP_VOL.filter(d=>d.current_rank===1).length;
  const tvNR = TOP_VOL.filter(d=>d.current_rank===null).length;
  const kwperfInsights: InsightItem[] = [
    {tone:'green',title:'Rank #1 wins on high volume',body:<>{B(tvR1)} of the {B(TOP_VOL.length)} highest-volume keywords hold position #1 this week.</>,icon:'ok'},
    {tone:'blue',title:'Funnel mix of #1 rankings',body:<>Of {B(315)} keywords at #1, {B(290)} are TOFU/MOFU and {B(25)} are BOFU. Bottom-funnel content is the thinnest layer to grow.</>},
    {tone:'red',title:'High-volume gaps',body:<>{B(tvNR)} top-volume keywords are not ranking, led by {B('zero day')} (368K SV). {B('cybersecurity')} (201K) is on page 3 at #24.</>,icon:'warn'},
  ];
  const topGain = POS_GAIN[0], topLoss = POS_LOSS[0];
  const posInsights: InsightItem[] = [
    {tone:POS_GAIN.length>=POS_LOSS.length?'green':'amber',title:POS_GAIN.length>=POS_LOSS.length?'Gainers lead the week':'Decliners outnumber gainers',body:<>{B(POS_GAIN.length)} keywords improved vs {B(POS_LOSS.length)} that declined WoW. Biggest jump: {B(topGain.keyword)} (#{topGain.prev} → #{topGain.cur}).</>},
    {tone:'red',title:'Biggest drop to recover',body:<>{B(topLoss.keyword)} fell #{topLoss.prev} → #{topLoss.cur}. Only keywords ranked in both weeks are listed, so NR moves are excluded.</>},
    {tone:'blue',title:'Stable core, volatile edge',body:<>{B(solidR1.length)} keywords have held #1 for 24+ weeks, while {B(volatileKws.length)} swing by 70+ positions. Use the category filter to isolate each product line.</>},
  ];
  const cs = CAT_STATS[selectedCat], ws = WOW_STATS[selectedCat], wm = WOW_MOVERS[selectedCat];
  const catInsights: InsightItem[] = cs && ws ? [
    {tone:cs.pct as number>=75?'green':'amber',title:`${selectedCat}: Page 1 coverage`,body:<>{B(`${cs.valid} of ${cs.total}`)} keywords are on Page 1 ({B(`${cs.pct}%`)}), with {B(cs.rank1)} at #1 and an average position of {B(cs.avg_rank)}.</>,icon:'ok'},
    {tone:ws.net>=0?'green':'red',title:ws.net>=0?'Net gain week over week':'Net loss week over week',body:<>{B(ws.improving)} keywords improved and {B(ws.declining)} declined, a net of {B(`${ws.net>=0?'+':'−'}${Math.abs(ws.net)}`)}. {wm?.gainers[0]&&<>Top gain: {B(wm.gainers[0].kw)} (#{wm.gainers[0].from} → #{wm.gainers[0].to}). </>}{wm?.decliners[0]&&<>Top drop: {B(wm.decliners[0].kw)} (#{wm.decliners[0].from} → #{wm.decliners[0].to}).</>}</>,icon:ws.net>=0?'up':'down'},
    {tone:cs.not_ranking>10?'red':'blue',title:cs.not_ranking>0?'Growth opportunity':'Full visibility',body:cs.not_ranking>0?<>{B(cs.not_ranking)} keywords are not ranking ({B(`${Math.round(cs.not_ranking/cs.total*100)}%`)} of the set). Content for these terms is the largest upside.</>:<>Every tracked keyword in this category ranks in the top 100. Focus on lifting Page 1 keywords to #1.</>,icon:'info'},
  ] : [
    {tone:'blue',title:'Backlink view',body:<>Compare keywords with and without backlinks to see where link-building lifts rankings.</>},
    {tone:'green',title:'Page 1 leaders',body:<>{B(464)} of 660 keywords rank on Page 1 and {B(315)} sit at #1 across all categories.</>},
    {tone:'amber',title:'Watch list',body:<>{B(121)} keywords are not ranking. Select a category tab to see its share.</>},
  ];
  const riskInsights: InsightItem[] = [
    {tone:'red',title:'Biggest single risk',body:<>{B('zero day')} (368K SV) and {B('phishing')} (49.5K SV) remain off the SERP. Together they represent 417.5K monthly searches. In total, {B(121)} of 660 keywords are not ranking and {B(107)} have lost rank since Dec 31.</>},
    {tone:'amber',title:'AI Cybersecurity exposure',body:<>{B('59 of 136')} AI Cybersecurity keywords are not ranking, {B(41)} declined WoW (22 lost positions, 19 dropped off), and only {B('43.4%')} are on Page 1, the weakest coverage of the 9 categories.</>},
    {tone:'blue',title:'Quantum Security slipping',body:<>{B('11 of 28')} Quantum keywords are not ranking and {B(10)} declined WoW (5 lost positions, 5 dropped off). {B('PQC')} fell from #4 to #18 and {B('quantum computing')} (74K SV) still does not rank.</>},
  ];
  const gainInsights: InsightItem[] = [
    {tone:'green',title:'Referrals surged',body:<>Referrals grew {B('+71.12%')} ({B('+7,728')} sessions), the largest percentage gain in the traffic report.</>},
    {tone:'green',title:'Branded demand is rising',body:<>Branded GSC traffic is up {B('+1.61%')} ({B('+2,008')} clicks), outpacing non-branded growth of {B('+0.43%')}.</>},
    {tone:'blue',title:'Product pages gain',body:<>{B('/products')} rose {B('+5.41%')} ({B('+752')}) and {B('/about-us')} {B('+6.52%')} ({B('+300')}), two of the strongest GA page gains this week.</>,icon:'up'},
  ];
  const trafficInsights: InsightItem[] = [
    {tone:'green',title:'Organic traffic grew',body:<>All Organic Traffic reached {B(tf('allOrganic'))}, up {B(sp(TRAFFIC_WOW.allOrganic.pct))} ({B(sg(TRAFFIC_WOW.allOrganic.abs))}) WoW. Branded is {B(tf('branded'))} and Non-Branded {B(tf('nonBranded'))}.</>},
    {tone:'blue',title:'Branded leads growth',body:<>Branded traffic rose {B(sp(TRAFFIC_WOW.branded.pct))} versus {B(sp(TRAFFIC_WOW.nonBranded.pct))} for non-branded, showing stronger brand demand than new-keyword discovery.</>,icon:'info'},
    {tone:'amber',title:'Direct total fell, valid direct grew',body:<>Direct (All) fell {B(sp(TRAFFIC_WOW.directGA.pct))}, but Direct (Valid) rose {B(sp(TRAFFIC_WOW.directValid.pct))}. The drop is non-relevant traffic, not lost audience.</>,icon:'warn'},
  ];

=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:'#F5F7FA',color:'#0F172A',fontSize:13,lineHeight:1.5,minHeight:'100vh',overflowX:'hidden'}}>
      <div className="fn-page">

        {/* HEADER */}
        <div className="fn-header">
          <div className="fn-logo-box">
<<<<<<< HEAD
            <ImageWithFallback src={fortinetLogo} alt="Fortinet logo" className="fn-logo-img" />
          </div>
          <div className="fn-header-body">
            <div className="fn-header-eyebrow">SEO INTELLIGENCE</div>
            <div className="fn-header-title">Fortinet Week Over Week Metrics</div>
            <div className="fn-header-sub">Dec 31, 2025 → Oct 07, 2026 · Weekly Avg Base Rank · 660 Keywords · 9 Product Categories</div>
          </div>
          <div className="fn-header-badges">
            <span className="fn-badge fn-badge-green"><span className="fn-live-dot"></span>315 at #1</span>
            <span className="fn-badge fn-badge-blue">41 Weeks Tracked</span>
            <span className="fn-badge fn-badge-amber">Oct 07, 2026</span>
=======
            <svg viewBox="0 0 32 32"><path d="M16 2L4 7v9c0 7.7 5.1 14.9 12 17 6.9-2.1 12-9.3 12-17V7L16 2z"/></svg>
          </div>
          <div className="fn-header-body">
            <div className="fn-header-title">Fortinet Week Over Week Metrics</div>
            <div className="fn-header-sub">Dec 31, 2025 → Sep 30, 2026 · Weekly Avg Base Rank · 660 Keywords · 9 Product Categories</div>
          </div>
          <div className="fn-header-badges">
            <span className="fn-badge fn-badge-green"><span className="fn-live-dot"></span>318 at #1</span>
            <span className="fn-badge fn-badge-blue">40 Weeks Tracked</span>
            <span className="fn-badge fn-badge-amber">Sep 30, 2026</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            <span className="fn-badge fn-badge-red">Live</span>
          </div>
        </div>

        {/* TABS */}
        <div className="fn-tabs-bar">
<<<<<<< HEAD
          <button className={`fn-tab-btn fn-tab-home${activeTab==='home'?' active':''}`} onClick={()=>handleTabSwitch('home')} title="Home" aria-label="Home">⌂ Home</button>
=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
          {[
            {id:'traffic',label:'📈 Traffic Overview'},
            {id:'overview',label:'⬡ Position Overview'},
            {id:'kwperf',label:'🔑 Keyword Performance'},
            {id:'position',label:'📍 Keyword Position Insight'},
<<<<<<< HEAD
            {id:'categories',label:'◫ By Category'},
            {id:'risk',label:'⚠ Top Risk'},
            {id:'gainloss',label:'📊 Gain & Loss'}
=======
            {id:'kwhealth',label:'🏥 Keyword Ranking Health'},
            {id:'categories',label:'◫ By Category'},
            {id:'risk',label:'⚠ Top Risk'},
            {id:'gainloss',label:'📊 Gain & Loss'},
            {id:'takeaways',label:'★ Key Takeaways'}
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
          ].map(t=>(
            <button
              key={t.id}
              className={`fn-tab-btn${activeTab===t.id?' active':''}`}
              onClick={()=>handleTabSwitch(t.id)}
            >{t.label}</button>
          ))}
        </div>

<<<<<<< HEAD
        {/* ═══ HOME ═══ */}
        <div className={`fn-tab-panel${activeTab==='home'?' active':''}`}>
          <HomePage onOpen={openFromHome} />
        </div>

        {/* ═══ OVERVIEW ═══ */}
        <div className={`fn-tab-panel${activeTab==='overview'?' active':''}`}>
          <TabHead eyebrow="02 — POSITION OVERVIEW" title="Position Overview" sub="Rank #1, Page 1 and not-ranking totals across 660 keywords" accent="#1A56DB" onHome={()=>handleTabSwitch('home')} />
          <KeyInsights items={overviewInsights} />
=======
        {/* ═══ OVERVIEW ═══ */}
        <div className={`fn-tab-panel${activeTab==='overview'?' active':''}`}>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
          <div className="fn-kpi-strip">
            <div className="fn-kpi fn-kpi-green">
              <div className="fn-kpi-label">Rank #1 Keywords</div>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:6}}>
<<<<<<< HEAD
                <div className="fn-kpi-val green">315</div>
                <span style={{fontSize:13,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>▼ 0.9% WoW</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",letterSpacing:'.02em',marginTop:2,marginBottom:2}}>Prev 318</div>
              <div className="fn-kpi-sub">47.7% of all tracked</div>
=======
                <div className="fn-kpi-val green">318</div>
                <span style={{fontSize:13,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>▼ 14.7% WoW</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",letterSpacing:'.02em',marginTop:2,marginBottom:2}}>Prev 373</div>
              <div className="fn-kpi-sub">48.2% of all tracked</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            </div>
            <div className="fn-kpi fn-kpi-blue">
              <div className="fn-kpi-label">Page 1</div>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:6}}>
<<<<<<< HEAD
                <div className="fn-kpi-val blue">464</div>
                <span style={{fontSize:13,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>▼ 4.7% WoW</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",letterSpacing:'.02em',marginTop:2,marginBottom:2}}>Prev 487</div>
              <div className="fn-kpi-sub">70.3% of all tracked keywords</div>
=======
                <div className="fn-kpi-val blue">487</div>
                <span style={{fontSize:13,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>▼ 2.0% WoW</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",letterSpacing:'.02em',marginTop:2,marginBottom:2}}>Prev 497</div>
              <div className="fn-kpi-sub">73.8% of all tracked keywords</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            </div>
            <div className="fn-kpi fn-kpi-cyan">
              <div className="fn-kpi-label">Rank 11–100</div>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:6}}>
<<<<<<< HEAD
                <div className="fn-kpi-val cyan">75</div>
                <span style={{fontSize:13,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>▼ 14.8% WoW</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",letterSpacing:'.02em',marginTop:2,marginBottom:2}}>Prev 88</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:4}}>
                <div className="fn-kpi-sub" style={{margin:0}}>11.4% of all tracked</div>
=======
                <div className="fn-kpi-val cyan">88</div>
                <span style={{fontSize:13,fontWeight:700,color:'#059669',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>▲ 4.8% WoW</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",letterSpacing:'.02em',marginTop:2,marginBottom:2}}>Prev 84</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:4}}>
                <div className="fn-kpi-sub" style={{margin:0}}>13.3% of all tracked</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                <button onClick={()=>setModal1100(true)} style={{fontSize:10,fontWeight:700,color:'#fff',background:'#F97316',border:'none',borderRadius:20,padding:'2px 10px',cursor:'pointer',fontFamily:"'DM Mono',monospace",letterSpacing:'.03em',whiteSpace:'nowrap'}}>VIEW LIST</button>
              </div>
            </div>
            <div className="fn-kpi fn-kpi-amber">
              <div className="fn-kpi-label">Not Ranking</div>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:6}}>
<<<<<<< HEAD
                <div className="fn-kpi-val amber">121</div>
                <span style={{fontSize:13,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>▲ 42.4% WoW</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",letterSpacing:'.02em',marginTop:2,marginBottom:2}}>Prev 85</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:4}}>
                <div className="fn-kpi-sub" style={{margin:0}}>18.3% of all tracked</div>
=======
                <div className="fn-kpi-val amber">85</div>
                <span style={{fontSize:13,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>▲ 7.6% WoW</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",letterSpacing:'.02em',marginTop:2,marginBottom:2}}>Prev 79</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:4}}>
                <div className="fn-kpi-sub" style={{margin:0}}>12.9% of all tracked</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                <button onClick={()=>setModalNR(true)} style={{fontSize:10,fontWeight:700,color:'#fff',background:'#F97316',border:'none',borderRadius:20,padding:'2px 10px',cursor:'pointer',fontFamily:"'DM Mono',monospace",letterSpacing:'.03em',whiteSpace:'nowrap'}}>VIEW LIST</button>
              </div>
            </div>
            <div className="fn-kpi" style={{background:'rgba(99,102,241,.07)',border:'1.5px solid rgba(99,102,241,.25)'}}>
              <div className="fn-kpi-label" style={{color:'#4338CA'}}>AIO Keywords</div>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:6}}>
<<<<<<< HEAD
                <div className="fn-kpi-val" style={{color:'#4338CA'}}>290</div>
                <span style={{fontSize:13,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>▼ 3.0% WoW</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",letterSpacing:'.02em',marginTop:2,marginBottom:2}}>Prev 299</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:4}}>
                <div className="fn-kpi-sub" style={{margin:0}}>43.9% of all tracked</div>
=======
                <div className="fn-kpi-val" style={{color:'#4338CA'}}>299</div>
                <span style={{fontSize:13,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>▼ 18.8% WoW</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",letterSpacing:'.02em',marginTop:2,marginBottom:2}}>Prev 368</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:4}}>
                <div className="fn-kpi-sub" style={{margin:0}}>45.3% of all tracked</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                <button onClick={()=>setModalAIO(true)} style={{fontSize:10,fontWeight:700,color:'#fff',background:'#4338CA',border:'none',borderRadius:20,padding:'2px 10px',cursor:'pointer',fontFamily:"'DM Mono',monospace",letterSpacing:'.03em',whiteSpace:'nowrap'}}>VIEW LIST</button>
              </div>
            </div>
            <div className="fn-kpi fn-kpi-red">
              <div className="fn-kpi-label">Total Tracked</div>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:6}}>
                <div className="fn-kpi-val red">660</div>
                <span style={{fontSize:13,fontWeight:600,color:'#94A3B8',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',letterSpacing:'.01em'}}>0.0% WoW</span>
              </div>
              <div className="fn-kpi-sub">9 product categories</div>
            </div>
          </div>

          {/* Funnel KPI Strip — TOFU / MOFU / BOFU */}
          {(()=>{
            const cols = [
              {
                intent:'TOFU',
                label:'Top of Funnel',
                desc:'Informational / Awareness',
                color:'#1A56DB', colorVar:'var(--blue)', bgVar:'rgba(26,86,219,.07)', border:'rgba(26,86,219,.2)',
<<<<<<< HEAD
                keywords:446, page1:337, rank1:248,
                kwPct:((446/660)*100).toFixed(1),
                p1Pct:((337/464)*100).toFixed(1),
=======
                keywords:446, page1:353, rank1:253,
                kwPct:((446/660)*100).toFixed(1),
                p1Pct:((353/487)*100).toFixed(1),
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              },
              {
                intent:'MOFU',
                label:'Middle of Funnel',
                desc:'Consideration / Evaluation',
                color:'#0E7490', colorVar:'var(--cyan)', bgVar:'rgba(14,116,144,.07)', border:'rgba(14,116,144,.2)',
<<<<<<< HEAD
                keywords:130, page1:76, rank1:42,
                kwPct:((130/660)*100).toFixed(1),
                p1Pct:((76/464)*100).toFixed(1),
=======
                keywords:130, page1:81, rank1:36,
                kwPct:((130/660)*100).toFixed(1),
                p1Pct:((81/487)*100).toFixed(1),
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              },
              {
                intent:'BOFU',
                label:'Bottom of Funnel',
                desc:'Commercial / Purchase Intent',
                color:'#7C3AED', colorVar:'var(--purple)', bgVar:'rgba(124,58,237,.07)', border:'rgba(124,58,237,.2)',
<<<<<<< HEAD
                keywords:84, page1:51, rank1:25,
                kwPct:((84/660)*100).toFixed(1),
                p1Pct:((51/464)*100).toFixed(1),
=======
                keywords:84, page1:53, rank1:29,
                kwPct:((84/660)*100).toFixed(1),
                p1Pct:((53/487)*100).toFixed(1),
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              },
            ];
            return (
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:18}}>
                {cols.map(c=>(
                  <div key={c.intent} style={{background:c.bgVar,border:`1.5px solid ${c.border}`,borderRadius:12,padding:'16px 18px',position:'relative',overflow:'hidden'}}>
                    {/* top accent */}
                    <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:c.color,borderRadius:'12px 12px 0 0'}}/>
                    {/* intent badge + label */}
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,marginTop:2}}>
                      <span style={{fontSize:10,fontWeight:900,padding:'2px 8px',borderRadius:4,letterSpacing:'.08em',
                        background:c.color,color:'#fff',fontFamily:"'DM Mono',monospace"}}>{c.intent}</span>
                      <div>
                        <div style={{fontSize:10,fontWeight:700,color:'var(--text)',lineHeight:1}}>{c.label}</div>
                        <div style={{fontSize:8,color:'var(--text3)',marginTop:1}}>{c.desc}</div>
                      </div>
                    </div>
                    {/* 3-metric row */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
                      {[
                        {label:'Keywords',val:c.keywords,sub:null,color:'var(--text)'},
                        {label:'Rank #1',val:c.rank1,sub:`${((c.rank1/c.keywords)*100).toFixed(0)}% of intent`,color:'#059669'},
                        {label:'Page 1',val:c.page1,sub:`${((c.page1/c.keywords)*100).toFixed(0)}% of intent`,color:c.color},
                      ].map((m,i)=>(
                        <div key={i} style={{background:'rgba(255,255,255,.6)',borderRadius:8,padding:'8px 10px',textAlign:'center',border:'1px solid rgba(0,0,0,.05)'}}>
                          <div style={{fontSize:8,fontWeight:700,color:'var(--text3)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{m.label}</div>
                          <div style={{fontSize:22,fontWeight:900,color:m.color,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{m.val}</div>
                          <div style={{fontSize:8,color:'var(--text3)',marginTop:3}}>{m.sub}</div>
                        </div>
                      ))}
                    </div>
                    {/* Page 1 progress bar */}
                    <div style={{fontSize:8,color:'var(--text3)',fontFamily:"'DM Mono',monospace",marginBottom:3,textTransform:'uppercase',letterSpacing:'.04em'}}>Page 1 Coverage</div>
                    <div style={{height:5,background:'rgba(0,0,0,.07)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${c.p1Pct}%`,background:c.color,borderRadius:3,transition:'width .4s'}}/>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:3}}>
                      <span style={{fontSize:8,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>{c.page1} of {c.keywords} on Page 1</span>
                      <span style={{fontSize:9,fontWeight:800,color:c.color,fontFamily:"'DM Mono',monospace"}}>{c.p1Pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

<<<<<<< HEAD
          {/* ══ Category bar charts ══ */}
          <div className="fn-wowstrip">
            {(()=>{
              const g=Object.values(WOW_STATS).reduce((a,w)=>a+w.improving,0), d=Object.values(WOW_STATS).reduce((a,w)=>a+w.declining,0), st=Object.values(WOW_STATS).reduce((a,w)=>a+w.stable,0), n=g-d;
              return [
                {v:g,l:'GAINING',c:'#0A7A55'},{v:d,l:'DECLINING',c:'#D93025'},{v:st,l:'STABLE',c:'#475569'},{v:(n>=0?'+':'')+n,l:'NET WoW',c:n>=0?'#0A7A55':'#D93025'}
              ].map(m=>(<div key={m.l} className="fn-wowstrip-i" style={{borderColor:m.c}}><div className="fn-wowstrip-v" style={{color:m.c}}>{m.v}</div><div className="fn-wowstrip-l">{m.l}</div></div>));
            })()}
          </div>
          <div className="fn-grid2" style={{marginBottom:18}}>
            <div className="fn-card fn-card-blue">
              <div className="fn-card-head"><span className="fn-card-title">Total Keywords · Page 1 · Not Ranking (NR) — Highest to Lowest</span></div>
              <div className="fn-chart-wrap" style={{height:420}}><canvas id="catTotalsChart"></canvas></div>
            </div>
            <div className="fn-card fn-card-green">
              <div className="fn-card-head"><span className="fn-card-title">Average Position — Best to Weakest</span><span className="fn-card-meta">Lower = better · Oct 07</span></div>
              <div className="fn-chart-wrap" style={{height:420}}><canvas id="catAvgChart"></canvas></div>
            </div>
          </div>

=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
          {/* ══ Category Performance — Card Grid ══ */}
          {(()=>{
            const CAT_ORDER = ['NGFW','Zero Trust','SASE','SD-WAN','NAC','OT Security','AI Cybersecurity','Top Opportunities','Quantum Security'];
            const perfOf = (c:string):{level:string;color:string;rank:number;pct:number} => {
              const st = CAT_STATS[c]; if(!st) return {level:'LOW PERFORMANCE',color:'#DC2626',rank:3,pct:0};
              const pct = st.total>0?(st.valid/st.total*100):0;
              if (pct>=90 && st.avg_rank<=3.0) return {level:'VERY GOOD',color:'#059669',rank:0,pct};
              if (pct>=85 && st.avg_rank<=4.0) return {level:'GOOD',color:'#1A56DB',rank:1,pct};
              if (pct>=70)                      return {level:'NEEDS ATTENTION',color:'#D97706',rank:2,pct};
              return {level:'LOW PERFORMANCE',color:'#DC2626',rank:3,pct};
            };
            const SORTED_CATS = [...CAT_ORDER].sort((x,y)=>{const px=perfOf(x),py=perfOf(y); return px.rank-py.rank || py.pct-px.pct;});
            const FUNNEL_CFG: Record<string,{bg:string;text:string;border:string}> = {
              TOFU:{bg:'rgba(26,86,219,.08)',text:'#1A56DB',border:'rgba(26,86,219,.2)'},
              MOFU:{bg:'rgba(6,182,212,.08)',text:'#0E7490',border:'rgba(6,182,212,.2)'},
              BOFU:{bg:'rgba(124,58,237,.08)',text:'#7C3AED',border:'rgba(124,58,237,.2)'},
            };
            const totKw   = Object.values(CAT_STATS).reduce((a,s)=>a+s.total,0);
            const totR1   = Object.values(CAT_STATS).reduce((a,s)=>a+s.rank1,0);
            const totP1   = Object.values(CAT_STATS).reduce((a,s)=>a+s.valid,0);
<<<<<<< HEAD
            const totR11  = 75;
            const totNR   = Object.values(CAT_STATS).reduce((a,s)=>a+s.not_ranking,0);
            const totAIO  = 290;
=======
            const totR11  = 88;
            const totNR   = Object.values(CAT_STATS).reduce((a,s)=>a+s.not_ranking,0);
            const totAIO  = 299;
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            const totGain = Object.values(WOW_STATS).reduce((a,w)=>a+w.improving,0);
            const totDec  = Object.values(WOW_STATS).reduce((a,w)=>a+w.declining,0);
            const totSta  = Object.values(WOW_STATS).reduce((a,w)=>a+w.stable,0);
            const netWow  = totGain - totDec;
            return (
              <div>
                {/* Section header + aggregate totals */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,padding:'0 2px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:32,height:32,borderRadius:8,background:'rgba(26,86,219,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>◈</div>
                    <div>
                      <div style={{fontSize:15,fontWeight:800,color:'var(--text)',letterSpacing:'-.01em'}}>Category Performance — Unified Overview</div>
<<<<<<< HEAD
                      <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>Source: Semrush · All metrics · Oct 07, 2026 · WoW vs Sep 30</div>
=======
                      <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>Source: Semrush · All metrics · Sep 30, 2026 · WoW vs Sep 23</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:20,alignItems:'center'}}>
                    {[
                      {val:totKw,   label:'TOTAL KWS',    color:'var(--text)'},
                      {val:totR1,   label:'RANK #1',       color:'#059669'},
                      {val:totP1,   label:'PAGE 1',        color:'#1A56DB'},
                      {val:totR11,  label:'RANK 11–100',   color:'#0E7490'},
                      {val:totNR,   label:'NOT RANKING',   color:'#B45309'},
                      {val:totAIO,  label:'AIO',           color:'#4338CA'},
                      {val:totGain, label:'GAINING',       color:'#059669'},
                      {val:totDec,  label:'DECLINING',     color:'#DC2626'},
                      {val:totSta,  label:'STABLE',        color:'#64748B'},
                    ].map((m,i)=>(
                      <div key={i} style={{textAlign:'right'}}>
                        <div style={{fontSize:16,fontWeight:900,color:m.color,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{m.val}</div>
                        <div style={{fontSize:8,color:'var(--text3)',marginTop:2,letterSpacing:'.05em',textTransform:'uppercase'}}>{m.label}</div>
                      </div>
                    ))}
                    <div style={{textAlign:'right',paddingLeft:12,borderLeft:'1px solid var(--border)'}}>
                      <div style={{fontSize:16,fontWeight:900,color:netWow>=0?'#059669':'#DC2626',fontFamily:"'DM Mono',monospace",lineHeight:1}}>{netWow>=0?'+':''}{netWow}</div>
                      <div style={{fontSize:8,color:'var(--text3)',marginTop:2,letterSpacing:'.05em',textTransform:'uppercase'}}>NET WoW</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    </div>
                  </div>
                </div>

                {/* 3-column card grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
                  {SORTED_CATS.map(cat=>{
                    const s = CAT_STATS[cat];
                    const w = WOW_STATS[cat]||{improving:0,declining:0,stable:0,net:0,bothNr:0,tracked:0,total:s?.total||0};
                    const fm = WOW_MOVERS_FUNNEL[cat]||{TOFU:[],MOFU:[],BOFU:[]};
                    if(!s) return null;
                    const cc = catColor(cat);
                    const p1pct = s.total>0?(s.valid/s.total*100):0;
                    const totalTracked = (w.improving+w.declining+w.stable)||1;
                    const gainPct = w.improving/totalTracked*100;
                    const decPct  = w.declining/totalTracked*100;
                    const staPct  = w.stable/totalTracked*100;
                    const net = w.improving - w.declining;
                    // Performance Indicator — Page 1% + Avg Rank (both required)
                    const perfPct = s.total>0?(s.valid/s.total*100):0;
                    const {level: perfLevel, color: perfColor} = perfOf(cat);
<<<<<<< HEAD
                    const p1Aug26 = (WEEKLY_PAGE1[cat]??[]).slice(-1)[0]??s.valid;
                    const p1Aug19 = (WEEKLY_PAGE1[cat]??[]).slice(-2)[0]??s.valid;
=======
                    const p1Aug26 = (WEEKLY_PAGE1[cat]??[])[38]??s.valid;
                    const p1Aug19 = (WEEKLY_PAGE1[cat]??[])[37]??s.valid;
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    const p1Dec31 = (WEEKLY_PAGE1[cat]??[])[0]??s.valid;
                    const p1Wow   = p1Aug26 - p1Aug19;
                    const p1Ytd   = p1Aug26 - p1Dec31;
                    return (
                      <div key={cat} style={{
                        background:'var(--surface)',
                        border:'1px solid var(--border)',
                        borderRadius:12,
                        overflow:'hidden',
                        display:'flex',
                        flexDirection:'column',
                      }}>
                        {/* Category color accent bar */}
                        <div style={{height:4,background:cc,flexShrink:0}}/>

                        {/* Header */}
                        <div style={{padding:'13px 15px 10px',borderBottom:'1px solid var(--border)'}}>
                          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                            <div>
                              <div style={{fontSize:14,fontWeight:900,color:cc,letterSpacing:'-.015em',lineHeight:1.1}}>{cat}</div>
                              <div style={{fontSize:10,color:'var(--text3)',marginTop:3}}>
                                {(w.improving+w.declining+w.stable)||s.total} of {s.total} tracked
                              </div>
                            </div>
                            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                              <span style={{fontSize:8,padding:'2px 8px',borderRadius:4,fontWeight:800,letterSpacing:'.04em',
                                background:perfColor+'18',color:perfColor,fontFamily:"'DM Mono',monospace",
                                display:'inline-flex',alignItems:'center',gap:4,whiteSpace:'nowrap'}}>
                                <span style={{width:6,height:6,borderRadius:'50%',background:perfColor,display:'inline-block',flexShrink:0}}/>
                                {perfLevel}
                              </span>
                              {s.isNew&&<span style={{fontSize:8,padding:'2px 6px',borderRadius:4,fontWeight:800,
                                background:'rgba(245,158,11,.15)',color:'#92400E',fontFamily:"'DM Mono',monospace"}}>NEW</span>}
                            </div>
                          </div>
                          {/* Stacked bar: gain / stable / decline */}
                          <div style={{height:6,borderRadius:3,overflow:'hidden',display:'flex',gap:.5}}>
                            {gainPct>0&&<div style={{flex:gainPct,background:'#10B981',transition:'flex .4s'}}/>}
                            {staPct>0&&<div style={{flex:staPct,background:'rgba(100,116,139,.35)',transition:'flex .4s'}}/>}
                            {decPct>0&&<div style={{flex:decPct,background:'#EF4444',transition:'flex .4s'}}/>}
                          </div>
                        </div>

                        {/* Row 1: Total KWs | Rank #1 | Page 1 | AIO */}
                        {(()=>{
<<<<<<< HEAD
                          const AIO_BY_CAT:Record<string,number> = {'Top Opportunities':23,'AI Cybersecurity':37,'NGFW':69,'SD-WAN':46,'NAC':46,'Zero Trust':13,'OT Security':25,'Quantum Security':12,'SASE':19};
=======
                          const AIO_BY_CAT:Record<string,number> = {'Top Opportunities':16,'AI Cybersecurity':37,'NGFW':83,'SD-WAN':46,'NAC':47,'Zero Trust':11,'OT Security':21,'Quantum Security':15,'SASE':23};
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                          const aioVal = AIO_BY_CAT[cat]??0;
                          return (
                            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderBottom:'1px solid var(--border)'}}>
                              {[
                                {label:'Total KWs',val:String(s.total),color:'var(--text)',sub:null},
                                {label:'Rank #1',val:String(s.rank1),color:'#059669',sub:`${(s.rank1/s.total*100).toFixed(0)}%`},
                                {label:'Page 1',val:String(s.valid),color:'#1A56DB',sub:`${p1pct.toFixed(0)}%`},
                                {label:'AIO',val:String(aioVal),color:'#4338CA',sub:`${(aioVal/s.total*100).toFixed(0)}%`},
                              ].map((m,i)=>(
                                <div key={i} style={{padding:'9px 8px',textAlign:'center',borderRight:i<3?'1px solid var(--border)':undefined}}>
                                  <div style={{fontSize:15,fontWeight:900,color:m.color,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{m.val}</div>
                                  {m.sub&&<div style={{fontSize:9,color:'var(--text2)',marginTop:1,fontFamily:"'DM Mono',monospace",fontWeight:800}}>{m.sub}</div>}
                                  <div style={{fontSize:7,color:'var(--text3)',marginTop:3,textTransform:'uppercase',letterSpacing:'.07em',fontWeight:700}}>{m.label}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {/* Row 2: Gaining | Declining | Stable | Not Ranking | Avg Rank */}
                        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',borderBottom:'1px solid var(--border)'}}>
                          {[
                            {label:'↑ Gaining',val:w.improving,color:'#059669',pct:(w.improving/totalTracked*100).toFixed(0)+'%'},
                            {label:'↓ Declining',val:w.declining,color:'#DC2626',pct:(w.declining/totalTracked*100).toFixed(0)+'%'},
                            {label:'→ Stable',val:w.stable,color:'#64748B',pct:(w.stable/totalTracked*100).toFixed(0)+'%'},
                            {label:'Not Ranking',val:s.not_ranking,color:s.not_ranking>0?'#B45309':'var(--text3)',pct:null},
                            {label:'Avg Rank',val:`#${s.avg_rank.toFixed(1)}`,color:s.avg_rank<=3?'#059669':s.avg_rank<=7?'#B45309':'#DC2626',pct:null},
                          ].map((m,i)=>(
                            <div key={i} style={{padding:'8px 6px',textAlign:'center',borderRight:i<4?'1px solid var(--border)':undefined}}>
                              <div style={{fontSize:12,fontWeight:900,color:m.color,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{m.val}</div>
                              {m.pct&&<div style={{fontSize:9,color:'var(--text2)',marginTop:1,fontFamily:"'DM Mono',monospace",fontWeight:800}}>{m.pct}</div>}
                              <div style={{fontSize:7,color:'var(--text3)',marginTop:2,textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>{m.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Page 1 trajectory */}
                        <div style={{padding:'7px 14px',borderBottom:'1px solid var(--border)',background:'rgba(26,86,219,.03)',display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                          <span style={{fontSize:11,fontWeight:800,color:'#1A56DB',fontFamily:"'DM Mono',monospace"}}>{p1Aug26}</span>
                          <span style={{fontSize:9,color:'var(--text2)',fontWeight:800}}>on Page 1</span>
                          <span style={{fontSize:9,fontWeight:700,color:p1Wow>=0?'#059669':'#DC2626',fontFamily:"'DM Mono',monospace",background:p1Wow>=0?'rgba(5,150,105,.09)':'rgba(220,38,38,.08)',padding:'1px 5px',borderRadius:3}}>
<<<<<<< HEAD
                            {p1Wow>=0?'+':''}{p1Wow} vs Sep 30
=======
                            {p1Wow>=0?'+':''}{p1Wow} vs Sep 23
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                          </span>
                          <span style={{fontSize:9,fontWeight:700,color:p1Ytd>=0?'#059669':'#DC2626',fontFamily:"'DM Mono',monospace",background:p1Ytd>=0?'rgba(5,150,105,.09)':'rgba(220,38,38,.08)',padding:'1px 5px',borderRadius:3}}>
                            {p1Ytd>=0?'+':''}{p1Ytd} vs Dec 31
                          </span>
                        </div>

                        {/* Top Movers — flat by SV: top 3 gain + top 3 loss across all funnels */}
                        {(()=>{
                          const fmtV=(v:number)=>v>=1000?`${(v/1000).toFixed(v>=10000?0:1)}K`:String(v);
                          const allEntries = (['TOFU','MOFU','BOFU'] as const).flatMap(f=>
                            (fm[f]||[]).map(m=>({...m,funnel:f}))
                          );
                          const topGain = allEntries.filter(m=>m.d>0).sort((a,b)=>b.vol-a.vol).slice(0,3);
                          const topLoss = allEntries.filter(m=>m.d<0).sort((a,b)=>b.vol-a.vol).slice(0,3);
                          const rows = [...topGain,...topLoss];
                          if(rows.length===0) return null;
                          return (
                            <div style={{padding:'10px 13px 12px',flex:1}}>
<<<<<<< HEAD
                              <div style={{fontSize:8,fontWeight:800,color:'var(--text3)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>Top Movers · Sep 30→Oct 07</div>
=======
                              <div style={{fontSize:8,fontWeight:800,color:'var(--text3)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>Top Movers · Sep 23→Sep 30</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                              {/* column headers */}
                              <div style={{display:'grid',gridTemplateColumns:'1fr 42px 36px 68px',gap:3,marginBottom:4,paddingLeft:14}}>
                                {['Keyword','Funnel','SV','Pos Prev→Curr'].map(h=>(
                                  <span key={h} style={{fontSize:7,fontWeight:700,color:'#94A3B8',letterSpacing:'.05em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</span>
                                ))}
                              </div>
                              <div style={{display:'flex',flexDirection:'column',gap:2}}>
                                {rows.map((m,i)=>{
                                  const isGain=m.d>0;
                                  const mColor=isGain?'#059669':'#DC2626';
                                  const mBg=isGain?'rgba(5,150,105,.06)':'rgba(220,38,38,.05)';
                                  const mBorder=isGain?'rgba(5,150,105,.16)':'rgba(220,38,38,.14)';
                                  const fc=FUNNEL_CFG[m.funnel];
                                  return (
                                    <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 42px 36px 68px',gap:3,
                                      alignItems:'center',padding:'3px 5px',background:mBg,
                                      border:`1px solid ${mBorder}`,borderRadius:4}}>
                                      <div style={{display:'flex',alignItems:'center',gap:4,minWidth:0}}>
                                        <span style={{fontSize:9,color:mColor,fontWeight:900,flexShrink:0}}>{isGain?'↑':'↓'}</span>
                                        <span style={{fontSize:8,color:'var(--text)',fontFamily:"'DM Mono',monospace",
                                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.kw}</span>
                                      </div>
                                      <span style={{fontSize:7,color:fc.text,fontWeight:800,background:fc.bg,
                                        padding:'1px 4px',borderRadius:3,textAlign:'center',border:`1px solid ${fc.border}`}}>{m.funnel}</span>
                                      <span style={{fontSize:7,color:'#64748B',fontFamily:"'DM Mono',monospace",textAlign:'right'}}>{fmtV(m.vol)}</span>
                                      <span style={{fontSize:8,fontWeight:800,color:mColor,fontFamily:"'DM Mono',monospace",textAlign:'right',whiteSpace:'nowrap'}}>
<<<<<<< HEAD
                                        {m.from===0?101:'#'+m.from}→{m.to===0?101:'#'+m.to}
=======
                                        {m.from===0?'NR':'#'+m.from}→{m.to===0?'NR':'#'+m.to}
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="fn-card fn-full">
              <div className="fn-card-head">
                <div className="fn-card-icon" style={{background:'rgba(10,122,85,.1)'}}>📈</div>
<<<<<<< HEAD
                <span className="fn-card-title">Weekly Page 1 Count per Category — 41-Week Trajectory</span>
                <span className="fn-card-meta">Dec 2025 → Oct 2026</span>
=======
                <span className="fn-card-title">Weekly Page 1 Count per Category — 40-Week Trajectory</span>
                <span className="fn-card-meta">Dec 2025 → Sep 2026</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              <div className="fn-chart-wrap" style={{height:220}}><canvas id="weeklyR1Chart"></canvas></div>
            </div>
            <div className="fn-card fn-full">
              <div className="fn-card-head">
                <div className="fn-card-icon" style={{background:'rgba(26,86,219,.1)'}}>📉</div>
<<<<<<< HEAD
                <span className="fn-card-title">Weekly Average Position per Category — 41-Week Trajectory</span>
                <span className="fn-card-meta">Dec 2025 → Oct 2026 · lower = better</span>
=======
                <span className="fn-card-title">Weekly Average Position per Category — 40-Week Trajectory</span>
                <span className="fn-card-meta">Dec 2025 → Sep 2026 · lower = better</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              <div className="fn-chart-wrap" style={{height:220}}><canvas id="avgRankChart"></canvas></div>
            </div>
          </div>
        </div>

        {/* ═══ KEYWORD PERFORMANCE OVERVIEW ═══ */}
        <div className={`fn-tab-panel${activeTab==='kwperf'?' active':''}`}>
<<<<<<< HEAD
          <TabHead eyebrow="03 — KEYWORD PERFORMANCE" title="Keyword Performance" sub="Highest-volume keywords, #1 wins and funnel leaders" accent="#7C3AED" onHome={()=>handleTabSwitch('home')} />
          <KeyInsights items={kwperfInsights} />
=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611


          <div className="fn-grid2">
            <div className="fn-card">
              <div className="fn-card-head">
                <div className="fn-card-icon" style={{background:'rgba(217,48,37,.08)'}}>🎯</div>
                <span className="fn-card-title">Highest-Volume Keywords — Position Status</span>
                <span style={{fontSize:10,fontWeight:600,color:'var(--text3)',marginLeft:6,whiteSpace:'nowrap'}}>{TOP_VOL.length} Keywords</span>
<<<<<<< HEAD
                <span className="fn-card-meta">Oct 07, 2026</span>
=======
                <span className="fn-card-meta">Sep 30, 2026</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              {/* column headers */}
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'4px 12px 6px',marginBottom:2}}>
                <span style={{flex:1,fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Keyword</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:70}}>Category</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:44,textAlign:'right'}}>SV</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:52,textAlign:'center'}}>Funnel</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:28,textAlign:'center'}}>Pos</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:28,textAlign:'center'}}>WoW</span>
              </div>
              <div className="fn-scroll-list">
                {TOP_VOL.map((d,i)=>{
                  const funnelLabel = d.funnel||'TOFU';
                  const funnelColor = funnelLabel==='BOFU'?'#7C3AED':funnelLabel==='MOFU'?'#0E7490':'#1A56DB';
                  const funnelBg = funnelLabel==='BOFU'?'rgba(124,58,237,.08)':funnelLabel==='MOFU'?'rgba(6,182,212,.08)':'rgba(26,86,219,.08)';
                  return (
                  <div key={i} className="fn-kw-row">
                    <span className="fn-kw-name">{d.keyword}</span>
                    <span className={`fn-kw-cat fn-pill ${catClass(d.category)}`}>{d.category.replace('Top Opportunities','Top Opps')}</span>
                    <span className="fn-kw-vol">{fmtVol(d.vol_jan26)}</span>
                    <span style={{fontSize:9,fontWeight:700,color:funnelColor,background:funnelBg,padding:'2px 6px',borderRadius:4,fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',minWidth:52,textAlign:'center',flexShrink:0}}>{funnelLabel}</span>
<<<<<<< HEAD
                    <span className={`fn-kw-rank ${rankBadgeClass(d.current_rank)}`}>{d.current_rank??101}</span>
                    <span className={d.delta===999?(d.current_rank===null?'fn-delta-down':'fn-delta-up'):d.delta<0?'fn-delta-up':d.delta>0?'fn-delta-down':'fn-delta-flat'}>{d.delta===999?(d.current_rank===null?'↓101':'↑NEW'):d.delta<0?'↑'+Math.abs(d.delta):d.delta>0?'↓'+d.delta:'—'}</span>
=======
                    <span className={`fn-kw-rank ${rankBadgeClass(d.current_rank)}`}>{d.current_rank??'NR'}</span>
                    <span className={d.delta<0?'fn-delta-up':d.delta>0?'fn-delta-down':'fn-delta-flat'}>{d.delta<0?'↑'+Math.abs(d.delta):d.delta>0?'↓'+d.delta:'—'}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                  </div>
                  );
                })}
              </div>
            </div>
            <div className="fn-card">
              <div className="fn-card-head">
                <div className="fn-card-icon" style={{background:'rgba(10,122,85,.08)'}}>✦</div>
                <span className="fn-card-title">High-Volume Rank #1 Wins</span>
                <span style={{fontSize:10,fontWeight:600,color:'var(--text3)',marginLeft:6,whiteSpace:'nowrap'}}>{RANK1_KEYWORDS.length} Keywords</span>
<<<<<<< HEAD
                <span className="fn-card-meta">Vol &gt; 1,000 &amp; currently #1 · Oct 07, 2026</span>
=======
                <span className="fn-card-meta">Vol &gt; 1,000 &amp; currently #1 · Sep 30, 2026</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              {/* column headers */}
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'4px 12px 6px',marginBottom:2}}>
                <span style={{flex:1,fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Keyword</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:70}}>Category</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:44,textAlign:'right'}}>SV</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:52,textAlign:'center'}}>Funnel</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:28,textAlign:'center'}}>Pos</span>
              </div>
              <div className="fn-scroll-list">
                {RANK1_KEYWORDS.map((d,i)=>{
                  const funnelLabel = (d as any).funnel||'TOFU';
                  const funnelColor = funnelLabel==='BOFU'?'#7C3AED':funnelLabel==='MOFU'?'#0E7490':'#1A56DB';
                  const funnelBg = funnelLabel==='BOFU'?'rgba(124,58,237,.08)':funnelLabel==='MOFU'?'rgba(6,182,212,.08)':'rgba(26,86,219,.08)';
                  return (
                  <div key={i} className="fn-kw-row">
                    <span className="fn-kw-name">{d.keyword}</span>
                    <span className={`fn-kw-cat fn-pill ${catClass(d.category)}`}>{d.category.replace('Top Opportunities','Top Opps')}</span>
                    <span className="fn-kw-vol">{fmtVol(d.vol_jan26)}</span>
                    <span style={{fontSize:9,fontWeight:700,color:funnelColor,background:funnelBg,padding:'2px 6px',borderRadius:4,fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',minWidth:52,textAlign:'center',flexShrink:0}}>{funnelLabel}</span>
                    <span className="fn-kw-rank fn-r1">1</span>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Top Position #1 Keywords by Funnel Stage ── */}
          <div className="fn-grid2" style={{marginBottom:16}}>
            {/* TOFU/MOFU @#1 */}
            <div className="fn-card">
              <div className="fn-card-head">
                <div className="fn-card-icon" style={{background:'rgba(26,86,219,.1)'}}>🔵</div>
                <span className="fn-card-title">Top TOFU / MOFU Keywords — Position #1</span>
                <span style={{fontSize:10,fontWeight:600,color:'var(--text3)',marginLeft:6,whiteSpace:'nowrap'}}>{TOP_TOFU_R1_KWS.length} Keywords</span>
<<<<<<< HEAD
                <span className="fn-card-meta">Informational intent · sorted by search volume · Oct 07, 2026</span>
=======
                <span className="fn-card-meta">Informational intent · sorted by search volume · Sep 30, 2026</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              {/* per-category rank-1 TOFU/MOFU summary bar */}
              <div style={{display:'flex',gap:6,flexWrap:'wrap',padding:'6px 0 10px'}}>
                {Object.entries(CAT_STATS).map(([cat, s])=>{
                  const color = catColor(cat);
                  const label = cat.replace('Top Opportunities','Top Opps').replace('AI Cybersecurity','AI Cyber').replace('OT Security','OT Sec').replace('Quantum Security','Quantum');
                  return (
                    <div key={cat} style={{display:'flex',alignItems:'center',gap:4,background:'var(--surface2)',borderRadius:6,padding:'3px 8px',opacity:s.tofu_r1===0?.45:1}}>
                      <span style={{width:7,height:7,borderRadius:'50%',background:color,display:'inline-block',flexShrink:0}}></span>
                      <span style={{fontSize:10,fontWeight:700,color:'var(--text2)',fontFamily:"'DM Mono',monospace"}}>{label}</span>
                      <span style={{fontSize:11,fontWeight:800,color,fontFamily:"'DM Mono',monospace"}}>{s.tofu_r1}</span>
                    </div>
                  );
                })}
              </div>
              {/* column headers */}
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'4px 12px 6px',marginBottom:2}}>
                <span style={{flex:1,fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Keyword</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:70}}>Category</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:44,textAlign:'right'}}>SV</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:64,textAlign:'center'}}>Funnel</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:28,textAlign:'center'}}>Pos</span>
              </div>
              <div className="fn-scroll-list" style={{maxHeight:300}}>
                {TOP_TOFU_R1_KWS.map((d,i)=>(
                  <div key={i} className="fn-kw-row">
                    <span className="fn-kw-name">{d.keyword}</span>
                    <span className={`fn-kw-cat fn-pill ${catClass(d.category)}`}>{d.category.replace('Top Opportunities','Top Opps')}</span>
                    <span className="fn-kw-vol">{fmtVol(d.vol_jan26)}</span>
                    <span style={{fontSize:9,fontWeight:700,color:'var(--blue)',background:'rgba(26,86,219,.08)',padding:'2px 6px',borderRadius:4,fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',minWidth:64,textAlign:'center',flexShrink:0}}>TOFU/MOFU</span>
                    <span className="fn-kw-rank fn-r1">1</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOFU @#1 */}
            <div className="fn-card">
              <div className="fn-card-head">
                <div className="fn-card-icon" style={{background:'rgba(124,58,237,.1)'}}>🟣</div>
                <span className="fn-card-title">Top BOFU Keywords — Position #1</span>
                <span style={{fontSize:10,fontWeight:600,color:'var(--text3)',marginLeft:6,whiteSpace:'nowrap'}}>{TOP_BOFU_R1_KWS.length} Keywords</span>
<<<<<<< HEAD
                <span className="fn-card-meta">Commercial / purchase intent · sorted by search volume · Oct 07, 2026</span>
=======
                <span className="fn-card-meta">Commercial / purchase intent · sorted by search volume · Sep 30, 2026</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              {/* per-category rank-1 BOFU summary bar */}
              <div style={{display:'flex',gap:6,flexWrap:'wrap',padding:'6px 0 10px'}}>
                {Object.entries(CAT_STATS).map(([cat, s])=>{
                  const color = catColor(cat);
                  const label = cat.replace('Top Opportunities','Top Opps').replace('AI Cybersecurity','AI Cyber').replace('OT Security','OT Sec').replace('Quantum Security','Quantum');
                  return (
                    <div key={cat} style={{display:'flex',alignItems:'center',gap:4,background:'var(--surface2)',borderRadius:6,padding:'3px 8px',opacity:s.bofu_r1===0?.45:1}}>
                      <span style={{width:7,height:7,borderRadius:'50%',background:color,display:'inline-block',flexShrink:0}}></span>
                      <span style={{fontSize:10,fontWeight:700,color:'var(--text2)',fontFamily:"'DM Mono',monospace"}}>{label}</span>
                      <span style={{fontSize:11,fontWeight:800,color,fontFamily:"'DM Mono',monospace"}}>{s.bofu_r1}</span>
                    </div>
                  );
                })}
              </div>
              {/* column headers */}
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'4px 12px 6px',marginBottom:2}}>
                <span style={{flex:1,fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Keyword</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:70}}>Category</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:44,textAlign:'right'}}>SV</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:64,textAlign:'center'}}>Funnel</span>
                <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',minWidth:28,textAlign:'center'}}>Pos</span>
              </div>
              <div className="fn-scroll-list" style={{maxHeight:300}}>
                {TOP_BOFU_R1_KWS.map((d,i)=>(
                  <div key={i} className="fn-kw-row">
                    <span className="fn-kw-name">{d.keyword}</span>
                    <span className={`fn-kw-cat fn-pill ${catClass(d.category)}`}>{d.category.replace('Top Opportunities','Top Opps')}</span>
                    <span className="fn-kw-vol">{fmtVol(d.vol_jan26)}</span>
                    <span style={{fontSize:9,fontWeight:700,color:'var(--purple)',background:'rgba(124,58,237,.08)',padding:'2px 6px',borderRadius:4,fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',minWidth:64,textAlign:'center',flexShrink:0}}>BOFU</span>
                    <span className="fn-kw-rank fn-r1">1</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fn-card fn-full">
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(124,58,237,.1)'}}>📉</div>
              <span className="fn-card-title">SEO Position Journey — Top 10 High-Volume Keywords</span>
              <span style={{fontSize:10,fontWeight:600,color:'var(--text3)',marginLeft:6,whiteSpace:'nowrap'}}>10 Keywords</span>
<<<<<<< HEAD
              <span className="fn-card-meta">Dec 2025 → Oct 2026 · 41 weeks</span>
=======
              <span className="fn-card-meta">Dec 2025 → Sep 2026 · 40 weeks</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            </div>
            <div className="fn-chart-wrap" style={{height:280}}><canvas id="trendLine"></canvas></div>
          </div>
        </div>

        {/* ═══ POSITION TRACKER ═══ */}
        <div className={`fn-tab-panel${activeTab==='position'?' active':''}`}>
<<<<<<< HEAD
          <TabHead eyebrow="04 — KEYWORD POSITION INSIGHT" title="Keyword Position Insight" sub="Who is gaining, slipping, holding and swinging — filter every view by product category" accent="#1A56DB" onHome={()=>handleTabSwitch('home')} />
          <KeyInsights items={posInsights} />
          {(()=>{
            const inCat = (c:string)=>posCat==='All'||c===posCat;
            const gain = POS_GAIN.slice(0,20);
            const loss = POS_LOSS.slice(0,20);
            const solid = solidR1.filter(d=>inCat(solidR1Cats[d.keyword]??''));
            const vol = volatileKws.filter(d=>inCat(VOL_CAT[d.keyword]??''));
            const shortCat = (c:string)=>c.replace('Top Opportunities','Top Opps');
            const empty = (<div style={{padding:'26px 10px',textAlign:'center',fontSize:12,fontWeight:700,color:'var(--text3)'}}>No keywords in this view for {posCat}</div>);
            const tiles = [
              {label:'Top 20 Gainers (all categories)',n:gain.length,color:'#0A7A55',bg:'rgba(10,122,85,.1)'},
              {label:'Top 20 Decliners (all categories)',n:loss.length,color:'#D93025',bg:'rgba(217,48,37,.1)'},
              {label:'Rock-Solid #1',n:solid.length,color:'#1A56DB',bg:'rgba(26,86,219,.1)'},
              {label:'Volatile',n:vol.length,color:'#B45309',bg:'rgba(180,83,9,.12)'},
            ];
            const pill = (n:number,color:string,bg:string)=>(<span style={{fontSize:11,fontWeight:800,color,background:bg,borderRadius:12,padding:'3px 10px',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap'}}>{n} keywords</span>);
            return (<>
              <div className="fn-poscat">
                <div className="fn-poscat-top">
                  <span className="fn-poscat-label">Filter by Category</span>
                  <span className="fn-poscat-now">Showing: <b>{posCat==='All'?'All 9 categories':posCat}</b></span>
                </div>
                <div className="fn-poscat-pills">
                  {POS_CATS.map(c=>(
                    <button key={c} className={`fn-poscat-pill${posCat===c?' active':''}`} onClick={()=>setPosCat(c)}>{c}</button>
                  ))}
                </div>
                <div className="fn-poscat-tiles">
                  {tiles.map(t=>(
                    <div key={t.label} className="fn-poscat-tile" style={{borderColor:t.color,background:t.bg}}>
                      <div className="fn-poscat-n" style={{color:t.color}}>{t.n}</div>
                      <div className="fn-poscat-l">{t.label}</div>
=======
          <div className="fn-grid2">
            <div className="fn-card">
              <div className="fn-card-head">
                <div className="fn-card-icon" style={{background:'rgba(10,122,85,.1)'}}>🏆</div>
                <span className="fn-card-title">Rock-Solid Rank #1 — Consistent Holders</span>
                <span style={{display:'flex',alignItems:'center',gap:6,marginLeft:'auto'}}>
                  <span style={{fontSize:10,fontWeight:700,color:'#059669',background:'rgba(5,150,105,.1)',borderRadius:12,padding:'2px 8px',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap'}}>{solidR1.length} keywords</span>
                  <span className="fn-card-meta" style={{marginLeft:0}}>Consecutive Rank #1 for 24+ weeks (40-week history)</span>
                </span>
              </div>
              <div className="fn-scroll-list">
                {solidR1.map((d,i)=>(
                  <div key={i} className="fn-kw-row">
                    <span className="fn-kw-name">{d.keyword}</span>
                    <span className={`fn-kw-cat fn-pill ${catClass(solidR1Cats[d.keyword]??'')}`} style={{fontSize:8,flexShrink:0}}>{(solidR1Cats[d.keyword]??'').replace('Top Opportunities','Top Opps')}</span>
                    <span className="fn-kw-vol">{fmtVol(d.vol_jan26)}</span>
                    <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',fontWeight:600}}>{d.r1weeks}/40 wks</span>
                    <span className="fn-kw-rank fn-r1">1</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="fn-card">
              <div className="fn-card-head">
                <div className="fn-card-icon" style={{background:'rgba(180,83,9,.1)'}}>⚠</div>
                <span className="fn-card-title">Volatile Keywords — High SERP Instability</span>
                <span style={{display:'flex',alignItems:'center',gap:6,marginLeft:'auto'}}>
                  <span style={{fontSize:10,fontWeight:700,color:'#B45309',background:'rgba(180,83,9,.1)',borderRadius:12,padding:'2px 8px',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap'}}>{volatileKws.length} keywords</span>
                  <span className="fn-card-meta" style={{marginLeft:0}}>Wide rank variance across tracked weeks</span>
                </span>
              </div>
              <div className="fn-scroll-list">
                {volatileKws.map((d,i)=>(
                  <div key={i} className="fn-kw-row">
                    <span className="fn-kw-name">{d.keyword}</span>
                    <span className={`fn-kw-cat fn-pill ${catClass(({
                      'sd wan features comparison':'SD-WAN','top sd wan providers':'SD-WAN','ics/ot':'OT Security','phishing email':'Top Opportunities','deepfake ai best practices':'AI Cybersecurity','access control technologies':'NAC','next generation application firewall':'NGFW','phishing definition':'Top Opportunities','sd wan vendors':'SD-WAN','sd wan visibility':'SD-WAN'
                    } as Record<string,string>)[d.keyword]??'')}`} style={{fontSize:8,flexShrink:0}}>{(({
                      'sd wan features comparison':'SD-WAN','top sd wan providers':'SD-WAN','ics/ot':'OT Security','phishing email':'Top Opportunities','deepfake ai best practices':'AI Cybersecurity','access control technologies':'NAC','next generation application firewall':'NGFW','phishing definition':'Top Opportunities','sd wan vendors':'SD-WAN','sd wan visibility':'SD-WAN'
                    } as Record<string,string>)[d.keyword]??'').replace('Top Opportunities','Top Opps')}</span>
                    <span className="fn-kw-vol">{fmtVol(d.vol_jan26)}</span>
                    <span style={{fontSize:10,color:'var(--amber)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',fontWeight:700}}>#{d.min_rank}–{d.max_rank}</span>
                    <span className="fn-kw-rank fn-r3">{d.max_rank-d.min_rank}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Movers section merged into Position Tracker */}
          <div style={{marginTop:16}}>
            <div className="fn-grid2">
              <div className="fn-card">
                <div className="fn-card-head">
                  <div className="fn-card-icon" style={{background:'rgba(10,122,85,.1)'}}>🚀</div>
                  <span className="fn-card-title">Top Gainers — Biggest Rank Improvements</span>
                  <span style={{display:'flex',alignItems:'center',gap:6,marginLeft:'auto'}}>
                    <span style={{fontSize:10,fontWeight:700,color:'#059669',background:'rgba(5,150,105,.1)',borderRadius:12,padding:'2px 8px',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap'}}>{GAINERS.length} Keywords</span>
                    <span className="fn-card-meta" style={{marginLeft:0}}>Sep 23 → Sep 30, 2026 · sorted by positions gained</span>
                  </span>
                </div>
                <div>
                  {GAINERS.map((d,i)=>(
                    <div key={i} className="fn-mover-row fn-mover-up">
                      <span className="fn-mover-kw">{d.keyword}</span>
                      <span className={`fn-kw-cat fn-pill ${catClass(d.category)}`} style={{fontSize:8}}>{d.category.replace('Top Opportunities','Top Opps')}</span>
                      <span className="fn-kw-vol">{fmtVol(d.vol_jan26)}</span>
                      <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',fontWeight:600}}>#{d.baseline_rank??'NR'}→#{d.current_rank??'NR'}</span>
                      <span className={`fn-kw-rank ${rankBadgeClass(d.current_rank)}`}>{d.current_rank??'NR'}</span>
                      <span className="fn-mover-delta fn-mover-delta-up">↑{d.delta_baseline}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    </div>
                  ))}
                </div>
              </div>
<<<<<<< HEAD

              <div className="fn-grid2">
                <div className="fn-card fn-card-green">
                  <div className="fn-card-head">
                    <div className="fn-card-icon" style={{background:'rgba(10,122,85,.14)'}}>🚀</div>
                    <span className="fn-card-title">Top Gainers — Biggest Rank Improvements</span>
                    {pill(gain.length,'#0A7A55','rgba(10,122,85,.12)')}
                  </div>
                  <div className="fn-card-meta" style={{marginBottom:10}}>Top 20 · Sep 30 → Oct 07, 2026 · sorted by positions gained</div>
                  <div className="fn-scroll-list">
                    {gain.length===0?empty:gain.map((d,i)=>(
                      <div key={i} className="fn-mover-row fn-mover-up">
                        <span className="fn-mover-kw">{d.keyword}</span>
                        <span className={`fn-kw-cat fn-pill ${catClass(d.category)}`} style={{fontSize:8}}>{shortCat(d.category)}</span>
                        <span className="fn-kw-vol">{fmtVol(d.vol)}</span>
                        <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',fontWeight:700}}>#{d.prev}→#{d.cur}</span>
                        <span className={`fn-kw-rank ${rankBadgeClass(d.cur>100?null:d.cur)}`}>{d.cur}</span>
                        <span className="fn-mover-delta fn-mover-delta-up">↑{d.prev-d.cur}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="fn-card fn-card-red">
                  <div className="fn-card-head">
                    <div className="fn-card-icon" style={{background:'rgba(217,48,37,.12)'}}>⚡</div>
                    <span className="fn-card-title">Top Decliners — Biggest Rank Drops</span>
                    {pill(loss.length,'#D93025','rgba(217,48,37,.1)')}
                  </div>
                  <div className="fn-card-meta" style={{marginBottom:10}}>Top 20 · Sep 30 → Oct 07, 2026 · sorted by positions lost</div>
                  <div className="fn-scroll-list">
                    {loss.length===0?empty:loss.map((d,i)=>(
                      <div key={i} className="fn-mover-row fn-mover-down">
                        <span className="fn-mover-kw">{d.keyword}</span>
                        <span className={`fn-kw-cat fn-pill ${catClass(d.category)}`} style={{fontSize:8}}>{shortCat(d.category)}</span>
                        <span className="fn-kw-vol">{fmtVol(d.vol)}</span>
                        <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',fontWeight:700}}>#{d.prev}→#{d.cur}</span>
                        <span className={`fn-kw-rank ${rankBadgeClass(d.cur>100?null:d.cur)}`}>{d.cur}</span>
                        <span className="fn-mover-delta fn-mover-delta-down">{d.cur>100?'→101':`↓${d.cur-d.prev}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="fn-grid2">
                <div className="fn-card fn-card-blue">
                  <div className="fn-card-head">
                    <div className="fn-card-icon" style={{background:'rgba(10,122,85,.14)'}}>🏆</div>
                    <span className="fn-card-title">Rock-Solid Rank #1 — Consistent Holders</span>
                    {pill(solid.length,'#1A56DB','rgba(26,86,219,.1)')}
                  </div>
                  <div className="fn-card-meta" style={{marginBottom:10}}>Rank #1 for 24+ weeks (41-week history)</div>
                  <div className="fn-scroll-list">
                    {solid.length===0?empty:solid.map((d,i)=>(
                      <div key={i} className="fn-kw-row">
                        <span className="fn-kw-name">{d.keyword}</span>
                        <span className={`fn-kw-cat fn-pill ${catClass(solidR1Cats[d.keyword]??'')}`} style={{fontSize:8,flexShrink:0}}>{shortCat(solidR1Cats[d.keyword]??'')}</span>
                        <span className="fn-kw-vol">{fmtVol(d.vol_jan26)}</span>
                        <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',fontWeight:700}}>{d.r1weeks}/41 wks</span>
                        <span className="fn-kw-rank fn-r1">1</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="fn-card fn-card-amber">
                  <div className="fn-card-head">
                    <div className="fn-card-icon" style={{background:'rgba(180,83,9,.14)'}}>⚠</div>
                    <span className="fn-card-title">Volatile Keywords — High SERP Instability</span>
                    {pill(vol.length,'#B45309','rgba(180,83,9,.12)')}
                  </div>
                  <div className="fn-card-meta" style={{marginBottom:10}}>Wide rank variance across tracked weeks</div>
                  <div className="fn-scroll-list">
                    {vol.length===0?empty:vol.map((d,i)=>(
                      <div key={i} className="fn-kw-row">
                        <span className="fn-kw-name">{d.keyword}</span>
                        <span className={`fn-kw-cat fn-pill ${catClass(VOL_CAT[d.keyword]??'')}`} style={{fontSize:8,flexShrink:0}}>{shortCat(VOL_CAT[d.keyword]??'')}</span>
                        <span className="fn-kw-vol">{fmtVol(d.vol_jan26)}</span>
                        <span style={{fontSize:10,color:'var(--amber)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',fontWeight:800}}>#{d.min_rank}–{d.max_rank}</span>
                        <span className="fn-kw-rank fn-r3">{d.max_rank-d.min_rank}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>);
          })()}
        </div>


        {/* ═══ CATEGORIES ═══ */}
        <div className={`fn-tab-panel${activeTab==='categories'?' active':''}`}>
          <TabHead eyebrow="05 — BY CATEGORY" title="By Category" sub="Keyword position tables for each product category" accent="#0A7A55" onHome={()=>handleTabSwitch('home')} />
          <KeyInsights items={catInsights} />
=======
              <div className="fn-card">
                <div className="fn-card-head">
                  <div className="fn-card-icon" style={{background:'rgba(217,48,37,.08)'}}>⚡</div>
                  <span className="fn-card-title">Top Decliners — Biggest Rank Drops</span>
                  <span style={{display:'flex',alignItems:'center',gap:6,marginLeft:'auto'}}>
                    <span style={{fontSize:10,fontWeight:700,color:'#DC2626',background:'rgba(220,38,38,.08)',borderRadius:12,padding:'2px 8px',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap'}}>{DECLINERS.length} Keywords</span>
                    <span className="fn-card-meta" style={{marginLeft:0}}>Sep 23 → Sep 30, 2026 · sorted by positions lost</span>
                  </span>
                </div>
                <div>
                  {DECLINERS.map((d,i)=>(
                    <div key={i} className="fn-mover-row fn-mover-down">
                      <span className="fn-mover-kw">{d.keyword}</span>
                      <span className={`fn-kw-cat fn-pill ${catClass(d.category)}`} style={{fontSize:8}}>{d.category.replace('Top Opportunities','Top Opps')}</span>
                      <span className="fn-kw-vol">{fmtVol(d.vol_jan26)}</span>
                      <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap',fontWeight:600}}>#{d.baseline_rank??'NR'}→#{d.current_rank??'NR'}</span>
                      <span className={`fn-kw-rank ${rankBadgeClass(d.current_rank)}`}>{d.current_rank??'NR'}</span>
                      <span className="fn-mover-delta fn-mover-delta-down">{d.current_rank===null?'→NR':`↓${Math.abs(d.delta_baseline)}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* ═══ KEYWORD RANKING HEALTH ═══ */}
        <div className={`fn-tab-panel${activeTab==='kwhealth'?' active':''}`}>
          {(()=>{
            const KWH_DATA = [
              {cat:"Top Opportunities",kw:"vpn",sv:673000,funnel:"TOFU",cur:12,best:1,bestWks:13,worst:41,worstWks:1,vol:"Very High",ranks:[41,29,31,33,20,17,25,16,24,null,29,10,17,1,1,1,1,1,17,1,1,1,1,11,1,8,7,8,1,7,8,20,1,13,1,14,19,14,13,12]},
              {cat:"Top Opportunities",kw:"cybersecurity",sv:201000,funnel:"TOFU",cur:null,best:1,bestWks:13,worst:36,worstWks:2,vol:"Very High",ranks:[7,8,9,9,8,1,23,10,9,19,8,19,8,1,1,23,1,17,1,11,36,16,9,null,5,7,9,1,1,1,36,1,31,null,1,1,null,1,1,null]},
              {cat:"Top Opportunities",kw:"phishing",sv:49500,funnel:"TOFU",cur:26,best:1,bestWks:13,worst:67,worstWks:1,vol:"Very High",ranks:[12,16,17,13,16,16,12,19,5,1,16,26,10,1,6,1,1,1,1,1,1,48,1,1,1,1,1,49,27,57,19,20,26,29,28,24,25,50,67,26]},
              {cat:"Top Opportunities",kw:"malware",sv:40500,funnel:"TOFU",cur:16,best:1,bestWks:9,worst:27,worstWks:1,vol:"Very High",ranks:[7,5,5,5,26,5,7,7,1,1,1,10,9,10,1,1,1,18,1,15,1,19,14,null,12,13,null,22,21,18,27,20,21,25,19,23,14,1,16,16]},
              {cat:"Top Opportunities",kw:"phishing definition",sv:27100,funnel:"TOFU",cur:20,best:1,bestWks:12,worst:75,worstWks:1,vol:"Very High",ranks:[9,8,7,9,10,1,9,7,3,7,6,9,6,21,1,23,19,22,23,1,1,17,1,1,1,23,1,18,1,75,18,19,1,1,22,null,19,null,1,20]},
              {cat:"Top Opportunities",kw:"what is malware",sv:135000,funnel:"TOFU",cur:23,best:1,bestWks:7,worst:32,worstWks:1,vol:"Very High",ranks:[3,1,6,6,1,4,6,1,1,1,8,4,5,5,6,18,14,16,13,16,18,15,1,20,20,18,18,20,null,21,23,1,20,26,32,null,21,19,25,23]},
              {cat:"Top Opportunities",kw:"saml",sv:18100,funnel:"TOFU",cur:28,best:1,bestWks:4,worst:29,worstWks:1,vol:"Very High",ranks:[15,20,18,18,15,18,18,12,18,12,13,9,8,1,10,1,14,29,null,19,1,17,24,19,20,21,18,16,18,1,18,23,20,28,20,20,null,16,18,28]},
              {cat:"Top Opportunities",kw:"phishing email",sv:9900,funnel:"TOFU",cur:null,best:1,bestWks:3,worst:86,worstWks:2,vol:"Very High",ranks:[69,86,83,85,85,86,null,null,null,null,7,28,null,15,14,19,17,1,12,19,1,1,14,20,23,16,67,62,71,29,36,null,null,null,null,null,null,27,30,null]},
              {cat:"Top Opportunities",kw:"malware definition",sv:8100,funnel:"TOFU",cur:1,best:1,bestWks:5,worst:62,worstWks:1,vol:"Very High",ranks:[10,11,11,9,16,1,1,10,1,9,8,30,9,46,8,18,18,17,15,18,9,14,10,12,12,12,56,15,62,22,12,1,12,11,13,15,19,16,17,1]},
              {cat:"SD-WAN",kw:"wan definition",sv:6600,funnel:"TOFU",cur:1,best:1,bestWks:17,worst:35,worstWks:1,vol:"Very High",ranks:[7,8,8,4,22,35,6,9,5,6,5,6,9,4,21,22,1,13,11,1,12,1,1,1,15,1,1,1,1,7,1,13,1,1,15,1,1,1,1,1]},
              {cat:"NAC",kw:"iam identity access management",sv:1900,funnel:"TOFU",cur:1,best:1,bestWks:4,worst:27,worstWks:1,vol:"Very High",ranks:[7,5,5,6,6,8,8,9,13,1,24,6,6,1,6,21,15,1,18,16,6,7,17,15,7,12,22,9,null,20,10,14,20,9,20,9,10,16,27,1]},
              {cat:"NAC",kw:"identity and access management system",sv:720,funnel:"TOFU",cur:1,best:1,bestWks:11,worst:38,worstWks:1,vol:"Very High",ranks:[5,4,4,4,4,1,1,4,1,4,1,10,8,6,7,1,7,8,13,5,1,4,1,18,31,16,38,24,36,1,18,1,24,null,1,null,12,28,35,1]},
              {cat:"NAC",kw:"access control services",sv:720,funnel:"TOFU",cur:4,best:1,bestWks:6,worst:67,worstWks:1,vol:"Very High",ranks:[null,1,null,null,32,45,null,43,56,24,31,67,9,4,14,23,37,1,1,23,4,null,null,4,4,8,8,43,null,1,40,30,8,5,7,7,4,1,1,4]},
              {cat:"NAC",kw:"access control management",sv:720,funnel:"TOFU",cur:20,best:1,bestWks:3,worst:60,worstWks:1,vol:"Very High",ranks:[24,25,28,33,34,36,15,11,16,22,6,15,1,11,14,26,11,1,1,9,21,23,26,24,28,33,30,33,28,31,10,36,26,28,33,40,26,32,60,20]},
              {cat:"NGFW",kw:"layer 7 firewall",sv:390,funnel:"TOFU",cur:30,best:1,bestWks:1,worst:43,worstWks:1,vol:"Very High",ranks:[10,20,18,22,24,25,17,15,18,30,17,33,18,25,28,32,27,31,30,35,31,32,37,19,20,21,26,25,22,1,43,23,23,22,24,25,25,23,37,30]},
              {cat:"SD-WAN",kw:"sd wan router",sv:260,funnel:"TOFU",cur:null,best:1,bestWks:6,worst:73,worstWks:1,vol:"Very High",ranks:[13,73,21,22,22,19,null,1,1,25,12,22,23,13,29,1,20,12,23,1,18,18,15,12,20,null,17,1,11,29,33,null,null,1,null,null,null,null,null,null]},
              {cat:"SD-WAN",kw:"sd wan requirements",sv:90,funnel:"TOFU",cur:4,best:1,bestWks:10,worst:52,worstWks:1,vol:"Very High",ranks:[1,1,1,1,1,1,8,4,6,1,6,34,8,8,8,1,9,9,21,21,1,31,25,26,20,20,1,34,52,19,45,29,30,34,6,null,24,4,6,4]},
              {cat:"Top Opportunities",kw:"what is phishing",sv:74000,funnel:"TOFU",cur:7,best:1,bestWks:17,worst:21,worstWks:1,vol:"High",ranks:[1,4,4,7,11,8,6,1,9,1,3,1,6,5,1,1,1,1,8,1,1,1,null,1,1,10,1,8,1,10,8,21,10,8,1,8,14,1,9,7]},
              {cat:"Top Opportunities",kw:"iam",sv:33100,funnel:"TOFU",cur:1,best:1,bestWks:11,worst:37,worstWks:1,vol:"High",ranks:[null,10,12,16,19,17,1,1,1,9,18,16,20,8,13,1,24,28,23,1,null,null,24,null,null,23,20,25,23,null,8,37,2,1,1,1,27,1,1,1]},
              {cat:"Top Opportunities",kw:"internet of things",sv:22200,funnel:"TOFU",cur:28,best:1,bestWks:15,worst:32,worstWks:1,vol:"High",ranks:[17,19,1,1,1,15,1,13,16,1,13,1,1,17,15,null,31,25,22,1,21,1,1,1,1,1,1,null,24,30,32,26,1,28,31,27,25,24,27,28]},
              {cat:"Top Opportunities",kw:"multi factor authentication",sv:14800,funnel:"TOFU",cur:30,best:1,bestWks:4,worst:32,worstWks:1,vol:"High",ranks:[25,14,20,20,16,19,18,31,15,14,1,22,12,17,14,1,1,25,null,1,20,21,null,22,null,27,23,26,null,25,25,null,22,26,29,22,19,32,26,30]},
              {cat:"Top Opportunities",kw:"single sign on",sv:12100,funnel:"TOFU",cur:8,best:1,bestWks:17,worst:25,worstWks:1,vol:"High",ranks:[12,12,1,1,1,13,9,10,1,8,1,1,1,1,1,20,1,1,18,1,16,10,21,10,1,14,25,22,1,1,1,10,9,1,12,20,null,20,2,8]},
              {cat:"Top Opportunities",kw:"two factor authentication",sv:12100,funnel:"TOFU",cur:15,best:1,bestWks:4,worst:20,worstWks:3,vol:"High",ranks:[11,13,10,16,14,10,10,12,9,1,1,9,11,1,8,1,9,19,20,10,14,12,11,9,20,11,12,12,12,20,12,12,12,15,9,12,9,11,10,15]},
              {cat:"Zero Trust",kw:"zero trust architecture",sv:6600,funnel:"TOFU",cur:20,best:1,bestWks:24,worst:29,worstWks:1,vol:"High",ranks:[18,21,20,1,17,1,29,1,28,24,13,1,17,1,1,1,1,1,22,1,1,22,1,1,22,null,1,1,19,1,1,1,1,1,1,18,1,1,1,20]},
              {cat:"NAC",kw:"identity access management",sv:2900,funnel:"TOFU",cur:1,best:1,bestWks:14,worst:33,worstWks:1,vol:"High",ranks:[9,8,9,7,6,15,6,1,11,6,1,1,1,8,7,18,1,1,1,1,18,null,null,1,1,1,27,1,31,33,9,null,24,28,null,29,32,1,23,1]},
              {cat:"NAC",kw:"access control security",sv:1300,funnel:"TOFU",cur:9,best:1,bestWks:6,worst:31,worstWks:1,vol:"Very High",ranks:[7,8,7,1,7,7,8,5,6,9,26,31,8,10,7,26,10,1,1,1,1,1,null,6,2,null,6,8,8,6,7,4,9,4,9,9,10,10,9,9]},
              {cat:"NGFW",kw:"enterprise firewall",sv:320,funnel:"BOFU",cur:14,best:1,bestWks:16,worst:28,worstWks:1,vol:"High",ranks:[8,8,1,9,9,8,1,8,9,7,1,1,1,7,6,1,4,1,1,3,1,1,4,1,7,1,3,5,1,1,4,1,7,1,15,14,21,18,28,14]},
              {cat:"SD-WAN",kw:"sd wan appliance",sv:210,funnel:"TOFU",cur:8,best:1,bestWks:16,worst:37,worstWks:1,vol:"High",ranks:[1,1,1,1,5,5,6,19,13,22,6,6,9,1,1,17,1,1,1,7,1,19,17,16,22,1,1,18,1,26,1,1,1,21,27,null,22,21,37,8]},
              {cat:"SD-WAN",kw:"wan cost",sv:50,funnel:"TOFU",cur:32,best:1,bestWks:5,worst:33,worstWks:1,vol:"High",ranks:[1,1,1,11,11,9,10,7,10,8,9,10,21,null,1,16,15,1,17,13,12,8,7,14,16,9,12,9,12,10,28,10,10,15,14,11,12,16,33,32]},
              {cat:"SD-WAN",kw:"difference between wan and sd wan",sv:30,funnel:"TOFU",cur:8,best:1,bestWks:6,worst:41,worstWks:1,vol:"High",ranks:[19,28,29,20,19,28,26,9,1,1,23,23,14,1,16,24,1,41,28,32,9,1,13,11,11,8,9,10,11,11,10,11,9,6,1,7,8,6,7,8]},
              {cat:"SD-WAN",kw:"sd wan brands",sv:30,funnel:"TOFU",cur:14,best:1,bestWks:2,worst:45,worstWks:1,vol:"High",ranks:[31,34,14,25,19,24,20,29,24,17,31,34,null,null,null,null,43,45,null,null,28,20,31,12,20,12,15,12,null,21,32,1,1,15,15,null,15,16,16,14]},
              {cat:"SD-WAN",kw:"sd wan features comparison",sv:20,funnel:"TOFU",cur:1,best:1,bestWks:24,worst:95,worstWks:1,vol:"High",ranks:[1,13,1,1,1,1,11,1,1,1,1,17,1,1,10,1,2,2,1,1,1,4,1,1,4,1,1,1,4,21,1,3,95,5,6,1,6,5,1,1]},
              {cat:"SD-WAN",kw:"sd wan fec",sv:20,funnel:"MOFU",cur:7,best:1,bestWks:7,worst:21,worstWks:2,vol:"High",ranks:[9,21,10,11,9,10,14,1,20,9,9,10,9,9,9,1,14,8,9,1,1,1,21,8,18,1,1,9,9,7,10,8,9,13,9,9,7,8,8,7]},
              {cat:"NGFW",kw:"cheap firewall",sv:20,funnel:"BOFU",cur:14,best:1,bestWks:1,worst:29,worstWks:1,vol:"High",ranks:[29,8,9,9,10,19,10,20,8,6,4,4,6,8,10,16,8,17,16,11,14,10,14,12,13,15,11,16,16,1,12,19,10,9,21,16,13,9,13,14]},
              {cat:"Top Opportunities",kw:"proxy",sv:201000,funnel:"TOFU",cur:21,best:1,bestWks:6,worst:21,worstWks:1,vol:"Medium",ranks:[5,4,5,20,10,7,4,1,9,11,1,7,7,1,9,6,8,20,1,6,6,1,4,5,4,1,11,6,8,6,6,3,5,3,6,3,2,2,3,21]},
              {cat:"Top Opportunities",kw:"encryption",sv:22200,funnel:"TOFU",cur:null,best:1,bestWks:9,worst:25,worstWks:1,vol:"Medium",ranks:[10,10,6,1,1,1,19,25,20,12,7,8,1,9,1,1,16,16,16,16,17,15,1,15,1,16,18,1,20,10,10,18,22,20,23,16,21,21,24,null]},
              {cat:"Zero Trust",kw:"zero trust",sv:9900,funnel:"TOFU",cur:17,best:1,bestWks:15,worst:21,worstWks:1,vol:"Medium",ranks:[7,1,10,1,1,10,1,1,1,1,1,21,1,8,1,1,12,1,1,10,10,8,13,10,13,1,1,19,10,9,12,12,10,12,11,12,12,11,10,17]},
              {cat:"NAC",kw:"network access control software",sv:320,funnel:"TOFU",cur:2,best:1,bestWks:10,worst:11,worstWks:1,vol:"High",ranks:[8,8,7,8,8,8,7,1,8,8,1,2,9,8,7,5,11,1,1,9,4,6,1,5,1,1,1,4,1,3,3,4,3,2,2,3,1,2,5,2]},
              {cat:"NAC",kw:"iot security solutions",sv:1000,funnel:"BOFU",cur:1,best:1,bestWks:14,worst:64,worstWks:1,vol:"Medium",ranks:[2,2,2,1,5,1,1,1,1,1,1,21,1,1,2,2,18,1,2,2,2,6,7,6,7,6,7,7,8,7,6,5,1,7,8,1,64,5,1,1]},
              {cat:"SD-WAN",kw:"sd wan vendors",sv:390,funnel:"MOFU",cur:24,best:12,bestWks:3,worst:86,worstWks:2,vol:"Medium",ranks:[80,86,85,81,82,81,82,80,78,79,86,84,null,null,24,20,33,35,20,27,12,14,12,14,25,20,null,12,null,null,null,null,null,null,null,null,null,null,null,24]},
              {cat:"SD-WAN",kw:"cloud managed sd wan",sv:110,funnel:"MOFU",cur:27,best:1,bestWks:7,worst:27,worstWks:1,vol:"Very High",ranks:[5,4,5,9,5,5,9,3,5,1,4,1,22,4,8,4,20,4,14,2,1,4,1,1,1,null,1,null,null,null,null,null,null,null,null,null,null,null,3,27]},
              {cat:"SD-WAN",kw:"sd wan leaders",sv:90,funnel:"MOFU",cur:1,best:1,bestWks:16,worst:17,worstWks:1,vol:"Medium",ranks:[10,13,13,10,12,1,10,1,10,10,16,11,1,1,1,1,1,13,1,17,8,8,7,7,6,1,1,1,7,6,16,1,7,8,7,1,1,8,1,1]},
              {cat:"OT Security",kw:"ot/ics cybersecurity",sv:70,funnel:"MOFU",cur:54,best:1,bestWks:1,worst:72,worstWks:1,vol:"Medium",ranks:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,33,1,38,38,31,72,31,32,54]},
              {cat:"OT Security",kw:"iot/ot security",sv:70,funnel:"TOFU",cur:1,best:1,bestWks:2,worst:67,worstWks:1,vol:"Medium",ranks:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,11,22,22,7,9,67,10,9,12,1,1]},
              {cat:"SD-WAN",kw:"sd wan enterprise edition",sv:20,funnel:"TOFU",cur:1,best:1,bestWks:15,worst:33,worstWks:1,vol:"Very High",ranks:[6,5,1,5,4,33,3,5,5,11,28,15,5,1,1,5,4,4,4,1,5,5,4,1,1,2,1,3,3,1,3,1,2,1,1,1,1,2,1,1]},
              {cat:"NGFW",kw:"difference between next generation firewall and standard firewall",sv:30,funnel:"TOFU",cur:1,best:1,bestWks:10,worst:47,worstWks:1,vol:"Medium",ranks:[14,15,14,14,13,12,47,14,13,12,1,26,1,25,18,1,9,1,1,1,12,13,12,10,10,10,1,11,10,13,15,14,1,1,12,12,12,12,21,1]},
              {cat:"NGFW",kw:"next generation application firewall",sv:30,funnel:"BOFU",cur:2,best:1,bestWks:9,worst:76,worstWks:1,vol:"Medium",ranks:[1,1,1,4,4,1,7,1,1,1,4,8,21,7,7,6,1,4,5,1,25,26,20,20,22,22,26,27,24,26,38,34,25,26,29,25,76,22,3,2]},
              {cat:"NGFW",kw:"secure web gateway vs next generation firewall",sv:30,funnel:"TOFU",cur:11,best:1,bestWks:6,worst:37,worstWks:1,vol:"Medium",ranks:[14,17,17,17,15,17,15,1,16,22,15,16,23,1,1,23,19,1,1,15,1,null,23,17,null,23,null,14,14,33,37,22,13,13,13,13,12,12,15,11]},
              {cat:"SD-WAN",kw:"sd wan data center",sv:30,funnel:"TOFU",cur:14,best:1,bestWks:19,worst:24,worstWks:1,vol:"Medium",ranks:[1,3,1,1,10,21,3,1,1,1,1,4,1,1,1,4,1,1,5,3,10,13,1,8,1,8,1,1,11,24,20,13,10,8,15,1,1,16,1,14]},
              {cat:"NGFW",kw:"advantages to next generation firewalls",sv:30,funnel:"MOFU",cur:8,best:1,bestWks:14,worst:28,worstWks:1,vol:"Medium",ranks:[25,19,28,18,24,23,26,18,15,1,1,1,5,5,23,1,1,17,3,5,1,9,7,1,1,1,1,1,1,8,9,10,9,8,8,6,1,7,1,8]},
            ];

            const VOL_CFG:{[k:string]:{bg:string;color:string;dot:string}} = {
              'Very High':{bg:'rgba(220,38,38,.10)',color:'#B91C1C',dot:'#DC2626'},
              'High':{bg:'rgba(234,88,12,.10)',color:'#C2410C',dot:'#EA580C'},
              'Medium':{bg:'rgba(5,150,105,.10)',color:'#065F46',dot:'#059669'},
            };
            const CAT_COLOR:{[k:string]:string} = {
              'Top Opportunities':'#1A56DB','NGFW':'#7C3AED','SD-WAN':'#D97706',
              'NAC':'#059669','Zero Trust':'#0E7490','AI Cybersecurity':'#DB2777',
              'OT Security':'#B45309','Quantum Security':'#6D28D9','SASE':'#0F766E',
            };
            const FUNNEL_CFG:{[k:string]:{bg:string;color:string}} = {
              TOFU:{bg:'rgba(26,86,219,.09)',color:'#1D4ED8'},
              MOFU:{bg:'rgba(124,58,237,.09)',color:'#7C3AED'},
              BOFU:{bg:'rgba(5,150,105,.09)',color:'#065F46'},
            };

            const Sparkline = ({ranks}:{ranks:(number|null)[]}) => {
              const W=90, H=28, PAD=2;
              const valid = ranks.filter(v=>v!==null) as number[];
              if(valid.length < 2) {
                return <svg width={W} height={H} style={{display:'block'}}>
                  <text x={W/2} y={H/2+4} textAnchor="middle" fontSize="8" fill="#94A3B8">no data</text>
                </svg>;
              }
              const maxRank = Math.max(...valid, 100);
              const toY = (v:number) => PAD + (v / maxRank) * (H - PAD*2);
              const toX = (i:number) => PAD + (i / (ranks.length - 1)) * (W - PAD*2);

              // Build segments (split on nulls)
              const segments: {x:number;y:number}[][] = [];
              let seg: {x:number;y:number}[] = [];
              ranks.forEach((v,i) => {
                if(v===null) {
                  if(seg.length > 0) { segments.push(seg); seg=[]; }
                } else {
                  seg.push({x:toX(i), y:toY(v)});
                }
              });
              if(seg.length > 0) segments.push(seg);

              const lastNonNull = ranks.reduce((acc:(number|null), v) => v!==null ? v : acc, null);
              const lastIdx = ranks.length - 1 - [...ranks].reverse().findIndex(v=>v!==null);
              const lastX = toX(lastIdx), lastY = lastNonNull !== null ? toY(lastNonNull as number) : H/2;

              return (
                <svg width={W} height={H} style={{display:'block',overflow:'visible'}}>
                  {segments.map((pts, si) => (
                    pts.length > 1 ? (
                      <polyline key={si}
                        points={pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                        fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      />
                    ) : (
                      <circle key={si} cx={pts[0].x} cy={pts[0].y} r="1.5" fill="#1E293B"/>
                    )
                  ))}
                  <circle cx={lastX} cy={lastY} r="2" fill="#1E293B" stroke="#fff" strokeWidth="1"/>
                </svg>
              );
            };

            return (
              <div style={{padding:'0 0 12px'}}>
                {/* Header */}
                <div style={{background:'linear-gradient(135deg,#0F172A 0%,#1E293B 100%)',borderRadius:12,padding:'18px 24px',marginBottom:18,display:'flex',alignItems:'flex-start',gap:20,flexWrap:'wrap'}}>
                  <div style={{flex:'1 1 300px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                      <span style={{fontSize:11,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'#94A3B8'}}>SEO Intelligence</span>
                      <span style={{background:'rgba(26,86,219,.35)',color:'#93C5FD',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,border:'1px solid rgba(147,197,253,.3)'}}>40 Weeks · Dec 31 → Sep 30, 2026</span>
                    </div>
                    <div style={{fontSize:20,fontWeight:800,color:'#F8FAFC',lineHeight:1.2,marginBottom:4}}>Keyword Ranking Health</div>
                    <div style={{fontSize:12,color:'#94A3B8'}}>High-Impact Keyword Ranking Volatility & Anomalies</div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,alignSelf:'stretch'}}>
                    {[
                      {label:'Total KWs',count:50,bg:'rgba(26,86,219,.15)',color:'#93C5FD',border:'rgba(26,86,219,.3)',total:true},
                      {label:'Very High Volatility',count:KWH_DATA.filter(k=>k.vol==='Very High').length,bg:'rgba(220,38,38,.15)',color:'#FCA5A5',border:'rgba(220,38,38,.3)'},
                      {label:'High Volatility',count:KWH_DATA.filter(k=>k.vol==='High').length,bg:'rgba(234,88,12,.15)',color:'#FCD34D',border:'rgba(234,88,12,.3)'},
                      {label:'Medium Volatility',count:KWH_DATA.filter(k=>k.vol==='Medium').length,bg:'rgba(5,150,105,.15)',color:'#6EE7B7',border:'rgba(5,150,105,.3)'},
                    ].map(s=>(
                      <div key={s.label} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:10,padding:'10px 16px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:76}}>
                        {(s as any).total
                          ? <>
                              <div style={{fontSize:10,color:'#94A3B8',marginBottom:3,whiteSpace:'nowrap'}}>{s.label}</div>
                              <div style={{fontSize:22,fontWeight:900,color:s.color,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{s.count}</div>
                            </>
                          : <>
                              <div style={{fontSize:22,fontWeight:900,color:s.color,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{s.count} <span style={{fontSize:13,fontWeight:700}}>KWs</span></div>
                              <div style={{fontSize:10,color:'#94A3B8',marginTop:3,whiteSpace:'nowrap'}}>{s.label}</div>
                            </>
                        }
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:12,flexWrap:'wrap',paddingLeft:4}}>
                  <span style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Sparkline:</span>
                  <div style={{display:'flex',alignItems:'center',gap:4}}>
                    <span style={{width:20,height:2,background:'#1E293B',display:'inline-block',borderRadius:1}}/>
                    <span style={{fontSize:10,color:'var(--text3)'}}>40-week rank movement (lower on chart = better position)</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:4}}>
                    <span style={{width:8,height:8,background:'#E2E8F0',display:'inline-block',borderRadius:1}}/>
                    <span style={{fontSize:10,color:'var(--text3)'}}>Gap = Not Ranking that week</span>
                  </div>
                </div>

                {/* Table */}
                <div className="fn-card fn-full" style={{padding:0,overflow:'hidden'}}>
                  {/* Column header */}
                  <div style={{display:'grid',gridTemplateColumns:'140px 1fr 70px 56px 56px 50px 60px 96px 84px',gap:0,padding:'8px 14px',background:'var(--surface2)',borderBottom:'1px solid var(--border)'}}>
                    {['Category','Keyword','SV','Funnel','Current','Best / Wks','Worst / Wks','Trendline (40W)','Volatility'].map((h,i)=>(
                      <span key={i} style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:i===2?'center':i>=4&&i<=6?'center':i===7?'center':'left',paddingLeft:i===1?8:0}}>{h}</span>
                    ))}
                  </div>

                  {/* Rows — Very High → High → Medium, SV desc within each group */}
                  {[...KWH_DATA].sort((a,b)=>{const ord:Record<string,number>={'Very High':0,'High':1,'Medium':2};const g=(ord[a.vol]??9)-(ord[b.vol]??9);return g!==0?g:b.sv-a.sv;}).map((row, i) => {
                    const catCol = CAT_COLOR[row.cat] || '#64748B';
                    const fc = FUNNEL_CFG[row.funnel] || {bg:'transparent',color:'#64748B'};
                    const vc = VOL_CFG[row.vol] || VOL_CFG['High'];
                    const curLabel = row.cur == null ? 'NR' : `#${row.cur}`;
                    const curColor = row.cur == null ? '#DC2626' : row.cur === 1 ? '#059669' : row.cur > 20 ? '#DC2626' : row.cur > 10 ? '#EA580C' : '#1A56DB';
                    return (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'140px 1fr 70px 56px 56px 50px 60px 96px 84px',gap:0,padding:'7px 14px',
                        background:i%2===0?'transparent':'var(--surface2)',borderBottom:'1px solid var(--border)',alignItems:'center',
                        transition:'background .15s'}}>
                        {/* Category */}
                        <div style={{display:'flex',alignItems:'center',gap:5}}>
                          <span style={{width:3,height:16,borderRadius:2,background:catCol,flexShrink:0}}/>
                          <span style={{fontSize:10,fontWeight:700,color:catCol,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.cat}</span>
                        </div>
                        {/* Keyword */}
                        <div style={{paddingLeft:8}}>
                          <span style={{fontSize:11,fontWeight:700,color:'var(--text)',fontFamily:"'DM Mono',monospace",display:'block',wordBreak:'break-word',lineHeight:1.3}}>{row.kw}</span>
                        </div>
                        {/* SV */}
                        <div style={{textAlign:'center'}}>
                          <span style={{fontSize:11,fontWeight:700,color:'var(--text)',fontFamily:"'DM Mono',monospace"}}>
                            {row.sv>=1000000?`${(row.sv/1000000).toFixed(1)}M`:row.sv>=1000?`${(row.sv/1000).toFixed(0)}K`:row.sv}
                          </span>
                        </div>
                        {/* Funnel */}
                        <div style={{textAlign:'center'}}>
                          <span style={{fontSize:9,fontWeight:800,padding:'2px 6px',borderRadius:5,background:fc.bg,color:fc.color,letterSpacing:'.04em'}}>{row.funnel}</span>
                        </div>
                        {/* Current */}
                        <div style={{textAlign:'center'}}>
                          <span style={{fontSize:12,fontWeight:900,color:curColor,fontFamily:"'DM Mono',monospace"}}>{curLabel}</span>
                        </div>
                        {/* Best */}
                        <div style={{textAlign:'center'}}>
                          <div style={{fontSize:11,fontWeight:700,color:'#059669',fontFamily:"'DM Mono',monospace",lineHeight:1}}>#{row.best}</div>
                          <div style={{fontSize:8,fontWeight:700,color:'var(--text3)',marginTop:2,fontFamily:"'DM Mono',monospace"}}>{row.bestWks}wks</div>
                        </div>
                        {/* Worst */}
                        <div style={{textAlign:'center'}}>
                          <div style={{fontSize:11,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",lineHeight:1}}>#{row.worst}</div>
                          <div style={{fontSize:8,fontWeight:700,color:'var(--text3)',marginTop:2,fontFamily:"'DM Mono',monospace"}}>{row.worstWks}wks</div>
                        </div>
                        {/* Trendline */}
                        <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:32}}>
                          <Sparkline ranks={row.ranks}/>
                        </div>
                        {/* Volatility */}
                        <div style={{display:'flex',alignItems:'center',gap:5,justifyContent:'flex-end'}}>
                          <span style={{width:6,height:6,borderRadius:'50%',background:vc.dot,flexShrink:0}}/>
                          <span style={{fontSize:9,fontWeight:800,padding:'3px 7px',borderRadius:5,background:vc.bg,color:vc.color,letterSpacing:'.03em',whiteSpace:'nowrap'}}>{row.vol}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer note */}
                <div style={{marginTop:10,paddingLeft:4,display:'flex',gap:16,flexWrap:'wrap'}}>
                  <span style={{fontSize:9,color:'var(--text3)'}}>Source: Keyword rank tracker · 40 weeks Dec 31, 2025 → Sep 30, 2026 · Lower chart position = better rank</span>
                  <span style={{fontSize:9,color:'var(--text3)'}}>NR = Not Ranking that week · Sparkline gaps indicate weeks not tracked</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ═══ CATEGORIES ═══ */}
        <div className={`fn-tab-panel${activeTab==='categories'?' active':''}`}>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
          {(()=>{
            const isBacklinkView = selectedCat === 'Backlink KWs' || selectedCat === 'No Backlink KWs';
            const FUNNELS: Array<'All'|'TOFU'|'MOFU'|'BOFU'> = ['All','TOFU','MOFU','BOFU'];
            const FUNNEL_STYLE: Record<string,{active:string;activeBg:string;border:string}> = {
              All:  {active:'var(--text)',  activeBg:'var(--surface2)', border:'var(--border)'},
              TOFU: {active:'#1A56DB', activeBg:'rgba(26,86,219,.1)',  border:'rgba(26,86,219,.3)'},
              MOFU: {active:'#0E7490', activeBg:'rgba(6,182,212,.1)',  border:'rgba(6,182,212,.3)'},
              BOFU: {active:'#7C3AED', activeBg:'rgba(124,58,237,.1)', border:'rgba(124,58,237,.3)'},
            };
<<<<<<< HEAD
            const RANK_FILTERS: Array<'All'|'Rank1'|'Page1'|'Page2_10'|'NotRanking'|'Funnel'> = ['All','Rank1','Page1','Page2_10','NotRanking','Funnel'];
            const RANK_LABELS: Record<string,string> = {All:'All',Rank1:'Rank 1',Page1:'Page 1',Page2_10:'Page 2–10',NotRanking:'Not Ranking',Funnel:'FUNNEL'};
=======
            const RANK_FILTERS: Array<'All'|'Rank1'|'Page1'|'NotRanking'|'Funnel'> = ['All','Rank1','Page1','NotRanking','Funnel'];
            const RANK_LABELS: Record<string,string> = {All:'All',Rank1:'Rank 1',Page1:'Page 1',NotRanking:'Not Ranking',Funnel:'FUNNEL'};
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            const RANK_STYLE: Record<string,{active:string;activeBg:string;border:string}> = {
              All:        {active:'var(--text)',  activeBg:'var(--surface2)',          border:'var(--border)'},
              Rank1:      {active:'#059669',      activeBg:'rgba(5,150,105,.1)',       border:'rgba(5,150,105,.3)'},
              Page1:      {active:'#1A56DB',      activeBg:'rgba(26,86,219,.1)',       border:'rgba(26,86,219,.3)'},
<<<<<<< HEAD
              Page2_10:   {active:'#0E7490',      activeBg:'rgba(6,182,212,.1)',       border:'rgba(6,182,212,.3)'},
=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              NotRanking: {active:'#DC2626',      activeBg:'rgba(220,38,38,.1)',       border:'rgba(220,38,38,.3)'},
              Funnel:     {active:'#B45309',      activeBg:'rgba(180,83,9,.1)',        border:'rgba(180,83,9,.3)'},
            };
            const BL_FUNNEL_STYLE: Record<string,{active:string;activeBg:string;border:string}> = {
              TOFU: {active:'#1A56DB', activeBg:'rgba(26,86,219,.1)',  border:'rgba(26,86,219,.3)'},
              MOFU: {active:'#0E7490', activeBg:'rgba(6,182,212,.1)',  border:'rgba(6,182,212,.3)'},
              BOFU: {active:'#7C3AED', activeBg:'rgba(124,58,237,.1)', border:'rgba(124,58,237,.3)'},
            };

            // ── Backlink/No Backlink branch ──────────────────────────────────────────
            if (isBacklinkView) {
              const baseKws = selectedCat === 'Backlink KWs' ? BACKLINK_KWS : NO_BACKLINK_KWS;
              const getFunnel = (kw: KW) => (kw as any).funnel || 'TOFU';
              let blDisplay: KW[];
              if (selectedRankFilter === 'Rank1') {
                blDisplay = baseKws.filter(kw => kw.current_rank === 1).sort((a,b)=>b.vol_jan26-a.vol_jan26);
              } else if (selectedRankFilter === 'Page1') {
                blDisplay = baseKws.filter(kw => kw.current_rank !== null && kw.current_rank >= 1 && kw.current_rank <= 10).sort((a,b)=>b.vol_jan26-a.vol_jan26);
<<<<<<< HEAD
              } else if (selectedRankFilter === 'Page2_10') {
                blDisplay = baseKws.filter(kw => kw.current_rank !== null && kw.current_rank >= 11 && kw.current_rank <= 100).sort((a,b)=>b.vol_jan26-a.vol_jan26);
=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              } else if (selectedRankFilter === 'NotRanking') {
                blDisplay = baseKws.filter(kw => kw.current_rank === null).sort((a,b)=>b.vol_jan26-a.vol_jan26);
              } else if (selectedRankFilter === 'Funnel') {
                blDisplay = baseKws.filter(kw => getFunnel(kw) === selectedBlFunnel).sort((a,b)=>b.vol_jan26-a.vol_jan26);
              } else {
                blDisplay = [...baseKws].sort((a,b)=>b.vol_jan26-a.vol_jan26);
              }
              const rankCounts: Record<string,number> = {
                Rank1: baseKws.filter(kw=>kw.current_rank===1).length,
                Page1: baseKws.filter(kw=>kw.current_rank!==null&&kw.current_rank>=1&&kw.current_rank<=10).length,
<<<<<<< HEAD
                Page2_10: baseKws.filter(kw=>kw.current_rank!==null&&kw.current_rank>=11&&kw.current_rank<=100).length,
=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                NotRanking: baseKws.filter(kw=>kw.current_rank===null).length,
                Funnel: baseKws.filter(kw=>getFunnel(kw)===selectedBlFunnel).length,
              };
              const blFunnelCounts: Record<string,number> = {
                TOFU: baseKws.filter(kw=>getFunnel(kw)==='TOFU').length,
                MOFU: baseKws.filter(kw=>getFunnel(kw)==='MOFU').length,
                BOFU: baseKws.filter(kw=>getFunnel(kw)==='BOFU').length,
              };

              function buildBacklinkTableHtml(kws: KW[]): string {
                function sparklineSvg(ranks: (number|null)[]): string {
                  const W = 120, H = 28, NR = 101;
                  const mapped = ranks.map(r => (r === null || r === undefined) ? NR : r);
                  const anyRanked = mapped.some(r => r < NR);
                  if (!anyRanked) return `<svg width="${W}" height="${H}"></svg>`;
                  const maxR = Math.max(...mapped);
                  const pts: string[] = [];
                  mapped.forEach((r, i) => {
                    const x = (i / (mapped.length - 1)) * (W - 4) + 2;
                    const y = ((r - 1) / (maxR - 1)) * (H - 4) + 2;
                    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
                  });
                  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><polyline points="${pts.join(' ')}" fill="none" stroke="#1E293B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                }
                function cellStyle(r: number | null): string {
                  if (r === null || r === undefined) return 'text-align:center;color:#94A3B8;font-size:11px;font-family:\'DM Mono\',monospace;font-weight:600';
                  const bg = rankColor(r);
                  const col = rankTextColor(r);
                  return `text-align:center;background:${bg};color:${col};font-weight:700;font-size:12px;font-family:'DM Mono',monospace`;
                }
                const funnelBadge = (f: string) => {
                  const colors: Record<string,string> = {TOFU:'#1A56DB',MOFU:'#0E7490',BOFU:'#7C3AED'};
                  const bgs: Record<string,string> = {TOFU:'rgba(26,86,219,.1)',MOFU:'rgba(6,182,212,.1)',BOFU:'rgba(124,58,237,.1)'};
                  const c = colors[f]||'#64748B', b = bgs[f]||'transparent';
                  return `<span style="font-size:9px;font-weight:800;padding:2px 6px;border-radius:4px;background:${b};color:${c};letter-spacing:.04em;font-family:'DM Mono',monospace">${f}</span>`;
                };
                const catBadge = (cat: string) => {
                  const short = cat.replace('Top Opportunities','Top Opps').replace('AI Cybersecurity','AI Cyber').replace('Quantum Security','Quantum').replace('OT Security','OT Sec').replace('Zero Trust','ZeroTrust');
                  return `<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(100,116,139,.1);color:#475569;white-space:nowrap">${short}</span>`;
                };
                return `<table style="width:100%;border-collapse:collapse;font-size:12px">
                  <thead><tr style="border-bottom:2px solid #E2E8F0">
                    <th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;min-width:160px">Keyword</th>
                    <th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Category</th>
                    <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Funnel</th>
                    <th style="text-align:right;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">SV</th>
<<<<<<< HEAD
                    <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Sep 30<br/><span style="font-weight:500;font-size:9px">Prev Week</span></th>
                    <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#1A56DB;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Oct 07<br/><span style="font-weight:500;font-size:9px">Latest</span></th>
                    <th style="text-align:center;padding:8px 16px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">41-Week Trend<br/><span style="font-weight:500;font-size:9px">Dec → Oct 07</span></th>
                  </tr></thead>
                  <tbody>
                  ${kws.map((d,i) => {
                    const sep02 = d.ranks[39] ?? null;
                    const sep09 = d.ranks[40] ?? d.current_rank;
=======
                    <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Sep 23<br/><span style="font-weight:500;font-size:9px">Prev Week</span></th>
                    <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:700;color:#1A56DB;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Sep 30<br/><span style="font-weight:500;font-size:9px">Latest</span></th>
                    <th style="text-align:center;padding:8px 16px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">40-Week Trend<br/><span style="font-weight:500;font-size:9px">Dec → Sep 30</span></th>
                  </tr></thead>
                  <tbody>
                  ${kws.map((d,i) => {
                    const sep02 = d.ranks[38] ?? null;
                    const sep09 = d.ranks[39] ?? d.current_rank;
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    const vol = d.vol_jan26 >= 1000 ? `${(d.vol_jan26/1000).toFixed(d.vol_jan26>=10000?0:1)}K` : d.vol_jan26 > 0 ? String(d.vol_jan26) : '—';
                    const funnel = (d as any).funnel || 'TOFU';
                    const cat = (d as any).category || '';
                    return `<tr style="border-bottom:1px solid #F1F5F9;background:${i%2===0?'#ffffff':'#FAFBFC'}">
                      <td style="padding:7px 12px;font-weight:700;color:#0F172A;white-space:nowrap">${d.keyword}</td>
                      <td style="padding:7px 12px;white-space:nowrap">${catBadge(cat)}</td>
                      <td style="padding:7px 12px;text-align:center">${funnelBadge(funnel)}</td>
                      <td style="padding:7px 12px;text-align:right;font-size:11px;font-family:'DM Mono',monospace;font-weight:600;color:#64748B;white-space:nowrap">${vol}</td>
                      <td style="${cellStyle(sep02)};padding:7px 12px">${sep02??101}</td>
                      <td style="${cellStyle(sep09)};padding:7px 12px;border:1.5px solid rgba(26,86,219,.25)">${sep09??101}</td>
                      <td style="padding:5px 16px;text-align:center">${sparklineSvg(d.ranks)}</td>
                    </tr>`;
                  }).join('')}
                  </tbody>
                </table>`;
              }

              return (
                <div className="fn-card fn-full" style={{marginBottom:14}}>
                  <div className="fn-card-head" style={{flexWrap:'wrap',gap:8}}>
                    <div className="fn-card-icon" style={{background:'rgba(26,86,219,.1)'}}>🔗</div>
                    <span className="fn-card-title">Category Deep-Dive — Keyword Position Table</span>
                    <span className="fn-card-meta">Select category:</span>
                    <select
                      className="fn-select"
                      value={selectedCat}
                      onChange={e=>{setSelectedCat(e.target.value);setSelectedFunnel('All');setSelectedRankFilter('All');setSelectedBlFunnel('TOFU');}}
                    >
                      <option value="NGFW">NGFW (141 keywords)</option>
                      <option value="SD-WAN">SD-WAN (130 keywords)</option>
                      <option value="NAC">NAC (80 keywords)</option>
                      <option value="Zero Trust">Zero Trust (20 keywords)</option>
                      <option value="Top Opportunities">Top Opportunities (49 keywords)</option>
                      <option value="AI Cybersecurity">AI Cybersecurity (136 keywords) 🆕</option>
                      <option value="OT Security">OT Security (46 keywords) 🆕</option>
                      <option value="Quantum Security">Quantum Security (28 keywords) 🆕</option>
                      <option value="SASE">SASE (30 keywords) 🆕</option>
<<<<<<< HEAD
                      <option value="Backlink KWs">Backlink KWs ({BACKLINK_KWS.length} keywords) 🔗</option>
                      <option value="No Backlink KWs">No Backlink KWs ({NO_BACKLINK_KWS.length} keywords) 🔗</option>
=======
                      <option value="Backlink KWs">Backlink KWs (25 keywords) 🔗</option>
                      <option value="No Backlink KWs">No Backlink KWs (622 keywords) 🔗</option>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    </select>
                    {/* Rank + Funnel filter pills */}
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {RANK_FILTERS.map(rf=>{
                        const isActive = selectedRankFilter===rf;
                        const rs = RANK_STYLE[rf];
                        const count = rf==='All' ? baseKws.length : rankCounts[rf as keyof typeof rankCounts]??0;
                        return (
                          <button key={rf} onClick={()=>setSelectedRankFilter(rf)} style={{
                            fontSize:10,fontWeight:800,padding:'4px 10px',borderRadius:6,cursor:'pointer',
                            border:`1.5px solid ${isActive?rs.border:'var(--border)'}`,
                            background:isActive?rs.activeBg:'transparent',
                            color:isActive?rs.active:'var(--text3)',
                            fontFamily:"'DM Mono',monospace",letterSpacing:'.04em',
                            transition:'all .15s',whiteSpace:'nowrap',
                          }}>
                            {RANK_LABELS[rf]}{rf!=='Funnel'&&<span style={{marginLeft:4,fontSize:9,opacity:.75}}>({count})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* TOFU / MOFU / BOFU sub-pills — only when FUNNEL is active */}
                  {selectedRankFilter === 'Funnel' && (
                    <div style={{display:'flex',gap:6,padding:'8px 0 4px',borderTop:'1px solid var(--border)'}}>
                      {(['TOFU','MOFU','BOFU'] as const).map(f=>{
                        const isActive = selectedBlFunnel===f;
                        const fs = BL_FUNNEL_STYLE[f];
                        return (
                          <button key={f} onClick={()=>setSelectedBlFunnel(f)} style={{
                            fontSize:10,fontWeight:800,padding:'4px 10px',borderRadius:6,cursor:'pointer',
                            border:`1.5px solid ${isActive?fs.border:'var(--border)'}`,
                            background:isActive?fs.activeBg:'transparent',
                            color:isActive?fs.active:'var(--text3)',
                            fontFamily:"'DM Mono',monospace",letterSpacing:'.04em',
                            transition:'all .15s',
                          }}>
                            {f}<span style={{marginLeft:4,fontSize:9,opacity:.75}}>({blFunnelCounts[f]})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div style={{display:'flex',gap:10,marginBottom:10,flexWrap:'wrap'}}>
                    <div style={{marginLeft:'auto',fontSize:9,color:'var(--text3)',alignSelf:'center',fontFamily:"'DM Mono',monospace"}}>
                      showing {blDisplay.length} of {baseKws.length} keywords
                    </div>
                  </div>
                  {blDisplay.length === 0 && (
                    <div style={{padding:'20px',textAlign:'center',color:'var(--text3)',fontSize:12}}>
                      No keywords match this filter for {selectedCat}
                    </div>
                  )}
                  <div style={{overflowX:'auto'}} dangerouslySetInnerHTML={{__html: buildBacklinkTableHtml(blDisplay)}} />
                </div>
              );
            }

            // ── Standard category branch ─────────────────────────────────────────────
            const allKws = CAT_KEYWORDS[selectedCat]||[];
            const getKwFunnel = (kw: KW) => (kw as any).funnel || KW_FUNNEL_MAP[kw.keyword.toLowerCase()] || 'TOFU';

            let displayKws: KW[];
            if (selectedRankFilter === 'Rank1') {
              displayKws = allKws.filter(kw=>kw.current_rank===1).sort((a,b)=>b.vol_jan26-a.vol_jan26);
            } else if (selectedRankFilter === 'Page1') {
              displayKws = allKws.filter(kw=>kw.current_rank!==null&&kw.current_rank>=1&&kw.current_rank<=10).sort((a,b)=>b.vol_jan26-a.vol_jan26);
<<<<<<< HEAD
            } else if (selectedRankFilter === 'Page2_10') {
              displayKws = allKws.filter(kw=>kw.current_rank!==null&&kw.current_rank>=11&&kw.current_rank<=100).sort((a,b)=>b.vol_jan26-a.vol_jan26);
=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            } else if (selectedRankFilter === 'NotRanking') {
              displayKws = allKws.filter(kw=>kw.current_rank===null).sort((a,b)=>b.vol_jan26-a.vol_jan26);
            } else if (selectedRankFilter === 'Funnel') {
              displayKws = allKws.filter(kw=>getKwFunnel(kw)===selectedBlFunnel).sort((a,b)=>b.vol_jan26-a.vol_jan26);
            } else {
              displayKws = [...allKws].sort((a,b)=>b.vol_jan26-a.vol_jan26);
            }

            const catRankCounts: Record<string,number> = {
              Rank1:      allKws.filter(kw=>kw.current_rank===1).length,
              Page1:      allKws.filter(kw=>kw.current_rank!==null&&kw.current_rank>=1&&kw.current_rank<=10).length,
<<<<<<< HEAD
              Page2_10:   allKws.filter(kw=>kw.current_rank!==null&&kw.current_rank>=11&&kw.current_rank<=100).length,
=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              NotRanking: allKws.filter(kw=>kw.current_rank===null).length,
              Funnel:     allKws.filter(kw=>getKwFunnel(kw)===selectedBlFunnel).length,
            };
            const catFunnelCounts: Record<string,number> = {
              TOFU: allKws.filter(kw=>getKwFunnel(kw)==='TOFU').length,
              MOFU: allKws.filter(kw=>getKwFunnel(kw)==='MOFU').length,
              BOFU: allKws.filter(kw=>getKwFunnel(kw)==='BOFU').length,
            };

            return (
              <div className="fn-card fn-full" style={{marginBottom:14}}>
                <div className="fn-card-head" style={{flexWrap:'wrap',gap:8}}>
                  <div className="fn-card-icon" style={{background:'rgba(26,86,219,.1)'}}>◫</div>
                  <span className="fn-card-title">Category Deep-Dive — Keyword Position Table</span>
                  <span className="fn-card-meta">Select category:</span>
                  <select
                    className="fn-select"
                    value={selectedCat}
                    onChange={e=>{setSelectedCat(e.target.value);setSelectedFunnel('All');setSelectedRankFilter('All');setSelectedBlFunnel('TOFU');}}
                  >
                    <option value="NGFW">NGFW (141 keywords)</option>
                    <option value="SD-WAN">SD-WAN (130 keywords)</option>
                    <option value="NAC">NAC (80 keywords)</option>
                    <option value="Zero Trust">Zero Trust (20 keywords)</option>
                    <option value="Top Opportunities">Top Opportunities (49 keywords)</option>
                    <option value="AI Cybersecurity">AI Cybersecurity (136 keywords) 🆕</option>
                    <option value="OT Security">OT Security (46 keywords) 🆕</option>
                    <option value="Quantum Security">Quantum Security (28 keywords) 🆕</option>
                    <option value="SASE">SASE (30 keywords) 🆕</option>
<<<<<<< HEAD
                    <option value="Backlink KWs">Backlink KWs ({BACKLINK_KWS.length} keywords) 🔗</option>
                    <option value="No Backlink KWs">No Backlink KWs ({NO_BACKLINK_KWS.length} keywords) 🔗</option>
=======
                    <option value="Backlink KWs">Backlink KWs (25 keywords) 🔗</option>
                    <option value="No Backlink KWs">No Backlink KWs (622 keywords) 🔗</option>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                  </select>
                  {/* Rank + Funnel filter pills — same structure as Backlink branch */}
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {RANK_FILTERS.map(rf=>{
                      const isActive = selectedRankFilter===rf;
                      const rs = RANK_STYLE[rf];
<<<<<<< HEAD
                                            const count = rf==='All' ? (CAT_STATS[selectedCat]?.total ?? allKws.length) : catRankCounts[rf as keyof typeof catRankCounts]??0;
=======
                      const CAT_COUNT_OVERRIDE2:Record<string,number>={'NGFW':141,'NAC':80};
                      const count = rf==='All' ? (CAT_COUNT_OVERRIDE2[selectedCat]??allKws.length) : catRankCounts[rf as keyof typeof catRankCounts]??0;
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                      return (
                        <button key={rf} onClick={()=>setSelectedRankFilter(rf)} style={{
                          fontSize:10,fontWeight:800,padding:'4px 10px',borderRadius:6,cursor:'pointer',
                          border:`1.5px solid ${isActive?rs.border:'var(--border)'}`,
                          background:isActive?rs.activeBg:'transparent',
                          color:isActive?rs.active:'var(--text3)',
                          fontFamily:"'DM Mono',monospace",letterSpacing:'.04em',
                          transition:'all .15s',whiteSpace:'nowrap',
                        }}>
                          {RANK_LABELS[rf]}{rf!=='Funnel'&&<span style={{marginLeft:4,fontSize:9,opacity:.75}}>({count})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* TOFU / MOFU / BOFU sub-pills — only when FUNNEL is active */}
                {selectedRankFilter === 'Funnel' && (
                  <div style={{display:'flex',gap:6,padding:'8px 0 4px',borderTop:'1px solid var(--border)'}}>
                    {(['TOFU','MOFU','BOFU'] as const).map(f=>{
                      const isActive = selectedBlFunnel===f;
                      const fs = BL_FUNNEL_STYLE[f];
                      return (
                        <button key={f} onClick={()=>setSelectedBlFunnel(f)} style={{
                          fontSize:10,fontWeight:800,padding:'4px 10px',borderRadius:6,cursor:'pointer',
                          border:`1.5px solid ${isActive?fs.border:'var(--border)'}`,
                          background:isActive?fs.activeBg:'transparent',
                          color:isActive?fs.active:'var(--text3)',
                          fontFamily:"'DM Mono',monospace",letterSpacing:'.04em',
                          transition:'all .15s',
                        }}>
                          {f}<span style={{marginLeft:4,fontSize:9,opacity:.75}}>({catFunnelCounts[f]})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div style={{display:'flex',gap:10,marginBottom:10,flexWrap:'wrap'}}>
                  <div style={{marginLeft:'auto',fontSize:9,color:'var(--text3)',alignSelf:'center',fontFamily:"'DM Mono',monospace"}}>
                    {(()=>{
<<<<<<< HEAD
                                            const dispTotal = selectedCat==='NGFW'&&allKws.length===140?141:selectedCat==='SD-WAN'&&allKws.length===129?130:allKws.length;
=======
                      const CAT_COUNT_OVERRIDE:Record<string,number>={'NGFW':141,'NAC':80};
                      const dispTotal = CAT_COUNT_OVERRIDE[selectedCat]??allKws.length;
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                      const dispShowing = selectedRankFilter==='All'?dispTotal:displayKws.length;
                      return `showing ${dispShowing} of ${dispTotal} keywords`;
                    })()}
                  </div>
                </div>
                {displayKws.length === 0 && (
                  <div style={{padding:'20px',textAlign:'center',color:'var(--text3)',fontSize:12}}>
                    No keywords match this filter for {selectedCat}
                  </div>
                )}
                <div style={{overflowX:'auto'}} dangerouslySetInnerHTML={{__html: buildCatTableHtml(displayKws)}} />
              </div>
            );
          })()}
        </div>

        {/* ═══ TOP RISK ═══ */}
        <div className={`fn-tab-panel${activeTab==='risk'?' active':''}`}>
<<<<<<< HEAD
          <TabHead eyebrow="06 — TOP RISK" title="Top Risk" sub="Not-ranking and declining keywords that need action" accent="#D93025" onHome={()=>handleTabSwitch('home')} />
          <KeyInsights items={riskInsights} />
=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
          {/* Headline Risk Banner */}
          <div className="fn-card fn-full" style={{marginBottom:16,background:'linear-gradient(135deg,rgba(217,48,37,.06) 0%,rgba(183,28,28,.03) 100%)',border:'1.5px solid rgba(217,48,37,.25)'}}>
            <div style={{display:'flex',alignItems:'center',gap:18,padding:'4px 0'}}>
              <div style={{width:56,height:56,borderRadius:14,background:'rgba(217,48,37,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>⚠</div>
              <div style={{flex:1}}>
<<<<<<< HEAD
                <div style={{fontSize:11,fontWeight:700,color:'var(--red)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>Primary SEO Risk — Oct 07, 2026</div>
                <div style={{fontSize:20,fontWeight:800,color:'#0F172A',letterSpacing:'-.3px',marginBottom:4}}>"zero day" — <span style={{color:'var(--red)'}}>Not Ranking · 368K SV</span> · Highest-Volume NR Keyword</div>
                <div style={{fontSize:12,color:'var(--text3)',lineHeight:1.5}}>"zero day" (368K SV) and "phishing" (49.5K SV) remain off the SERP since baseline. 43 keywords that ranked on Dec 31, 2025 are now not ranking. AI Cybersecurity is the most at-risk category (41 declining WoW + 59 NR = 100 of 136 keywords affected). vpn recovered to Rank #1 (+11 WoW). Immediate action required on NR high-volume keywords and AI Cybersecurity content coverage.</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'12px 20px',background:'rgba(217,48,37,.08)',borderRadius:12,border:'1.5px solid rgba(217,48,37,.2)',flexShrink:0}}>
                <div style={{fontSize:36,fontWeight:900,color:'var(--red)',fontFamily:"'DM Mono',monospace",lineHeight:1}}>101</div>
                <div style={{fontSize:9,fontWeight:700,color:'var(--red)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'.06em'}}>zero day</div>
=======
                <div style={{fontSize:11,fontWeight:700,color:'var(--red)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>Primary SEO Risk — Sep 30, 2026</div>
                <div style={{fontSize:20,fontWeight:800,color:'#0F172A',letterSpacing:'-.3px',marginBottom:4}}>zero day — Dropped from Rank <span style={{color:'var(--red)'}}>#14 → NR</span> (Completely dropped off SERP)</div>
                <div style={{fontSize:12,color:'var(--text3)',lineHeight:1.5}}>Highest-volume keyword with complete SERP loss: 368,000 searches/mo. Held Rank #14 at baseline (Dec 31, 2025) — still not ranking as of Sep 30, 2026. Immediate content authority rebuild, E-E-A-T signals, and entity reinforcement required to recapture this keyword.</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'12px 20px',background:'rgba(217,48,37,.08)',borderRadius:12,border:'1.5px solid rgba(217,48,37,.2)',flexShrink:0}}>
                <div style={{fontSize:36,fontWeight:900,color:'var(--red)',fontFamily:"'DM Mono',monospace",lineHeight:1}}>→NR</div>
                <div style={{fontSize:9,fontWeight:700,color:'var(--red)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'.06em'}}>SERP Loss</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                <div style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace",marginTop:2}}>368K vol/mo</div>
              </div>
            </div>
          </div>

          {/* Risk KPI strip */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
            <div className="fn-kpi fn-kpi-red" style={{padding:'12px 16px'}}>
              <div className="fn-kpi-label">Total Decliners</div>
<<<<<<< HEAD
              <div className="fn-kpi-val red" style={{fontSize:28}}>{107}</div>
=======
              <div className="fn-kpi-val red" style={{fontSize:28}}>{128}</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              <div className="fn-kpi-sub">Keywords losing rank since Dec 31</div>
            </div>
            <div className="fn-kpi fn-kpi-amber" style={{padding:'12px 16px'}}>
              <div className="fn-kpi-label">Not Ranking</div>
<<<<<<< HEAD
              <div className="fn-kpi-val amber" style={{fontSize:28}}>121</div>
              <div className="fn-kpi-sub">Dropped off SERP · Oct 07</div>
            </div>
            <div className="fn-kpi fn-kpi-red" style={{padding:'12px 16px'}}>
              <div className="fn-kpi-label">Highest Vol at Risk</div>
              <div className="fn-kpi-val red" style={{fontSize:28}}>368K</div>
              <div className="fn-kpi-sub">zero day — Not Ranking</div>
            </div>
            <div className="fn-kpi fn-kpi-purple" style={{padding:'12px 16px'}}>
              <div className="fn-kpi-label">Most Affected Category</div>
              <div className="fn-kpi-val purple" style={{fontSize:18}}>AI Cybersecurity</div>
              <div className="fn-kpi-sub">41 declining WoW · 59 not ranking</div>
=======
              <div className="fn-kpi-val amber" style={{fontSize:28}}>85</div>
              <div className="fn-kpi-sub">Dropped off SERP · Sep 30</div>
            </div>
            <div className="fn-kpi fn-kpi-red" style={{padding:'12px 16px'}}>
              <div className="fn-kpi-label">Highest Vol at Risk</div>
              <div className="fn-kpi-val red" style={{fontSize:28}}>673K</div>
              <div className="fn-kpi-sub">vpn — Rank #12</div>
            </div>
            <div className="fn-kpi fn-kpi-purple" style={{padding:'12px 16px'}}>
              <div className="fn-kpi-label">Most Affected Category</div>
              <div className="fn-kpi-val purple" style={{fontSize:22}}>AI Cybersecurity</div>
              <div className="fn-kpi-sub">30 declining · 47 not ranking</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            </div>
          </div>

          <div className="fn-grid2" style={{marginBottom:16,alignItems:'flex-start'}}>
            {/* Top Declining Keywords */}
            <div className="fn-card">
              <div className="fn-card-head">
                <div className="fn-card-icon" style={{background:'rgba(217,48,37,.1)'}}>📉</div>
<<<<<<< HEAD
                <span className="fn-card-title">Top Declining Keywords — Dec 31 → Oct 07</span>
=======
                <span className="fn-card-title">Top Declining Keywords — Dec 31 → Sep 30</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                <span className="fn-card-meta">Baseline to current rank · positions lost</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8,padding:'4px 0'}}>
                {(()=>{
                  const TRD = [
<<<<<<< HEAD
                    {keyword:"network access control technologies",category:"NAC",vol_jan26:20,baseline_rank:3,current_rank:91,delta_baseline:88},
                    {keyword:"nac security solution",category:"NAC",vol_jan26:30,baseline_rank:1,current_rank:82,delta_baseline:81},
                    {keyword:"sd wan security concerns",category:"SD-WAN",vol_jan26:50,baseline_rank:1,current_rank:54,delta_baseline:53},
                    {keyword:"managed sd wan solutions",category:"SD-WAN",vol_jan26:480,baseline_rank:1,current_rank:53,delta_baseline:52},
                    {keyword:"sd wan access",category:"SD-WAN",vol_jan26:30,baseline_rank:12,current_rank:56,delta_baseline:44},
                    {keyword:"sdn sd wan",category:"SD-WAN",vol_jan26:20,baseline_rank:1,current_rank:43,delta_baseline:42},
                    {keyword:"what is zero trust",category:"Zero Trust",vol_jan26:2400,baseline_rank:38,current_rank:76,delta_baseline:38},
                    {keyword:"wan aggregation",category:"SD-WAN",vol_jan26:260,baseline_rank:1,current_rank:37,delta_baseline:36},
                    {keyword:"sdn wan",category:"SD-WAN",vol_jan26:260,baseline_rank:1,current_rank:34,delta_baseline:33},
                    {keyword:"sd wan overview",category:"SD-WAN",vol_jan26:70,baseline_rank:1,current_rank:34,delta_baseline:33},
                    {keyword:"iot",category:"Top Opportunities",vol_jan26:27100,baseline_rank:1,current_rank:30,delta_baseline:29},
                    {keyword:"sd wan for small business",category:"SD-WAN",vol_jan26:170,baseline_rank:1,current_rank:29,delta_baseline:28},
                    {keyword:"managed service sd wan",category:"SD-WAN",vol_jan26:210,baseline_rank:1,current_rank:26,delta_baseline:25},
                    {keyword:"how to setup a firewall",category:"NGFW",vol_jan26:140,baseline_rank:1,current_rank:25,delta_baseline:24},
                    {keyword:"fully managed sd wan",category:"SD-WAN",vol_jan26:320,baseline_rank:5,current_rank:27,delta_baseline:22},
=======
                    {keyword:"sd wan visibility",category:"SD-WAN",vol_jan26:70,baseline_rank:27,current_rank:92,delta_baseline:65},
                    {keyword:"enterprise grade firewall",category:"NGFW",vol_jan26:30,baseline_rank:1,current_rank:33,delta_baseline:32},
                    {keyword:"wan cost",category:"SD-WAN",vol_jan26:50,baseline_rank:1,current_rank:32,delta_baseline:31},
                    {keyword:"iot",category:"Top Opportunities",vol_jan26:27100,baseline_rank:1,current_rank:31,delta_baseline:30},
                    {keyword:"cloud managed sd wan",category:"SD-WAN",vol_jan26:110,baseline_rank:5,current_rank:27,delta_baseline:22},
                    {keyword:"what is malware",category:"Top Opportunities",vol_jan26:135000,baseline_rank:3,current_rank:23,delta_baseline:20},
                    {keyword:"waf firewall",category:"NGFW",vol_jan26:480,baseline_rank:1,current_rank:21,delta_baseline:20},
                    {keyword:"layer 7 firewall",category:"NGFW",vol_jan26:390,baseline_rank:10,current_rank:30,delta_baseline:20},
                    {keyword:"mpls vs hybrid wan",category:"SD-WAN",vol_jan26:40,baseline_rank:1,current_rank:20,delta_baseline:19},
                    {keyword:"sd-wan",category:"SD-WAN",vol_jan26:6600,baseline_rank:1,current_rank:18,delta_baseline:17},
                    {keyword:"sd-wan",category:"Top Opportunities",vol_jan26:6600,baseline_rank:1,current_rank:18,delta_baseline:17},
                    {keyword:"sd wan ready",category:"SD-WAN",vol_jan26:20,baseline_rank:1,current_rank:18,delta_baseline:17},
                    {keyword:"proxy",category:"Top Opportunities",vol_jan26:201000,baseline_rank:5,current_rank:21,delta_baseline:16},
                    {keyword:"network firewall",category:"NGFW",vol_jan26:3600,baseline_rank:1,current_rank:17,delta_baseline:16},
                    {keyword:"network firewall",category:"Top Opportunities",vol_jan26:3600,baseline_rank:1,current_rank:17,delta_baseline:16}
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                  ];
                  return TRD.map((d,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--surface)',border:'1.5px solid var(--border)',borderRadius:10,gap:10}}>
                    <span style={{fontWeight:700,fontSize:13,color:'var(--text)',flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.keyword}</span>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                      <span className={`fn-kw-cat fn-pill ${catClass(d.category)}`}>{d.category.replace('Top Opportunities','Top Opps')}</span>
                      <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:600,color:'var(--text3)',minWidth:32,textAlign:'right'}}>{fmtVol(d.vol_jan26)}</span>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace",fontWeight:600}}>#{d.baseline_rank}</span>
                        <span style={{fontSize:10,color:'var(--text4)'}}>→</span>
<<<<<<< HEAD
                        <span className={`fn-kw-rank ${rankBadgeClass(d.current_rank)}`}>{d.current_rank??101}</span>
                      </div>
                      <span style={{fontSize:12,fontWeight:800,color:'var(--red)',fontFamily:"'DM Mono',monospace",minWidth:28,textAlign:'right'}}>{d.current_rank===null?'→101':`↓${Math.abs(d.delta_baseline)}`}</span>
=======
                        <span className={`fn-kw-rank ${rankBadgeClass(d.current_rank)}`}>{d.current_rank??'NR'}</span>
                      </div>
                      <span style={{fontSize:12,fontWeight:800,color:'var(--red)',fontFamily:"'DM Mono',monospace",minWidth:28,textAlign:'right'}}>{d.current_rank===null?'→NR':`↓${Math.abs(d.delta_baseline)}`}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    </div>
                  </div>
                  ));
                })()}
              </div>
            </div>

            {/* Not Ranking + High-Priority Risks */}
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div className="fn-card">
                <div className="fn-card-head">
                  <div className="fn-card-icon" style={{background:'rgba(180,83,9,.1)'}}>🚫</div>
<<<<<<< HEAD
                  <span className="fn-card-title">Not Ranking on Oct 07</span>
                  <span className="fn-card-meta">Ranked Dec 31, 2025, now NR — top 12 by SV shown (121 NR total)</span>
=======
                  <span className="fn-card-title">Not Ranking on Sep 30</span>
                  <span className="fn-card-meta">Dropped off SERP — 23 keywords total · top 12 by SV shown</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:8,padding:'4px 0'}}>
                  {[
                    {keyword:"zero day",category:"Top Opportunities",vol:368000},
<<<<<<< HEAD
                    {keyword:"phishing",category:"Top Opportunities",vol:49500},
                    {keyword:"encryption",category:"Top Opportunities",vol:22200},
                    {keyword:"multi factor authentication",category:"Top Opportunities",vol:14800},
                    {keyword:"what is a proxy",category:"Top Opportunities",vol:12100},
                    {keyword:"phishing email",category:"Top Opportunities",vol:9900},
                    {keyword:"malware definition",category:"Top Opportunities",vol:8100},
                    {keyword:"encryption definition",category:"Top Opportunities",vol:6600},
                    {keyword:"bring your own device",category:"NAC",vol:2400},
                    {keyword:"what is iam",category:"NAC",vol:1900},
                    {keyword:"access control solutions",category:"NAC",vol:1900},
                    {keyword:"managed sd wan",category:"SD-WAN",vol:1000}
=======
                    {keyword:"cybersecurity",category:"Top Opportunities",vol:201000},
                    {keyword:"encryption",category:"Top Opportunities",vol:22200},
                    {keyword:"ethernet switch",category:"Top Opportunities",vol:14800},
                    {keyword:"phishing email",category:"Top Opportunities",vol:9900},
                    {keyword:"bring your own device",category:"NAC",vol:2400},
                    {keyword:"access control solutions",category:"NAC",vol:1900},
                    {keyword:"sd wan managed services",category:"SD-WAN",vol:880},
                    {keyword:"managed sd wan solutions",category:"SD-WAN",vol:480},
                    {keyword:"fully managed sd wan",category:"SD-WAN",vol:320},
                    {keyword:"sd wan router",category:"SD-WAN",vol:260},
                    {keyword:"sd wan companies",category:"SD-WAN",vol:210}
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                  ].map((d,i)=>(

                    <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--surface)',border:'1.5px solid var(--border)',borderRadius:10,gap:10}}>
                      <span style={{fontWeight:700,fontSize:13,color:'var(--text)',flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.keyword}</span>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        <span className={`fn-kw-cat fn-pill ${catClass(d.category)}`}>{d.category.replace('Top Opportunities','Top Opps')}</span>
                        <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:600,color:'var(--text3)',minWidth:36,textAlign:'right'}}>{fmtVol(d.vol)}</span>
<<<<<<< HEAD
                        <span className="fn-kw-rank fn-r-bad">101</span>
=======
                        <span className="fn-kw-rank fn-r-bad">NR</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fn-card">
                <div className="fn-card-head">
                  <div className="fn-card-icon" style={{background:'rgba(217,48,37,.1)'}}>🎯</div>
<<<<<<< HEAD
                  <span className="fn-card-title">Priority Risk Actions — Oct 2026</span>
=======
                  <span className="fn-card-title">Priority Risk Actions — Sep 2026</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                  <span className="fn-card-meta">Top 15 at-risk keywords · per funnel · SV high to low</span>
                </div>
                {(()=>{
                  type RiskKW = {kw:string;cat:string;sv:number;pos:string|null;funnel:'TOFU'|'MOFU'|'BOFU'};
                  const RISK_KWS: RiskKW[] = [
                    // ── TOFU ───────────────────────────────────────────────
<<<<<<< HEAD
                    {kw:"zero day",cat:"Top Opportunities",sv:368000,pos:null,funnel:"TOFU"},
                    {kw:"cybersecurity",cat:"Top Opportunities",sv:201000,pos:'24',funnel:"TOFU"},
                    {kw:"what is malware",cat:"Top Opportunities",sv:135000,pos:'20',funnel:"TOFU"},
                    {kw:"quantum computing",cat:"Quantum Security",sv:74000,pos:null,funnel:"TOFU"},
                    {kw:"phishing",cat:"Top Opportunities",sv:49500,pos:null,funnel:"TOFU"},
=======
                    {kw:"vpn",cat:"Top Opportunities",sv:673000,pos:'12',funnel:"TOFU"},
                    {kw:"zero day",cat:"Top Opportunities",sv:368000,pos:null,funnel:"TOFU"},
                    {kw:"proxy",cat:"Top Opportunities",sv:201000,pos:'21',funnel:"TOFU"},
                    {kw:"cybersecurity",cat:"Top Opportunities",sv:201000,pos:null,funnel:"TOFU"},
                    {kw:"what is malware",cat:"Top Opportunities",sv:135000,pos:'23',funnel:"TOFU"},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    // ── MOFU ───────────────────────────────────────────────
                    {kw:"vpn service",cat:"Top Opportunities",sv:9900,pos:null,funnel:"MOFU"},
                    {kw:"ai in risk management",cat:"AI Cybersecurity",sv:3600,pos:null,funnel:"MOFU"},
                    {kw:"ai risk management",cat:"AI Cybersecurity",sv:3600,pos:null,funnel:"MOFU"},
                    {kw:"ai risk management framework",cat:"AI Cybersecurity",sv:1300,pos:null,funnel:"MOFU"},
                    {kw:"ai risk assessment",cat:"AI Cybersecurity",sv:1300,pos:null,funnel:"MOFU"},
                    // ── BOFU ───────────────────────────────────────────────
<<<<<<< HEAD
                    {kw:"list of ai cybersecurity tools",cat:"AI Cybersecurity",sv:2400,pos:null,funnel:"BOFU"},
                    {kw:"aiops tools",cat:"AI Cybersecurity",sv:1900,pos:'13',funnel:"BOFU"},
                    {kw:"access control solutions",cat:"NAC",sv:1900,pos:null,funnel:"BOFU"},
                    {kw:"aiops platforms",cat:"AI Cybersecurity",sv:1300,pos:null,funnel:"BOFU"},
                    {kw:"ai security companies",cat:"AI Cybersecurity",sv:720,pos:null,funnel:"BOFU"},
=======
                    {kw:"ethernet switch",cat:"Top Opportunities",sv:14800,pos:null,funnel:"BOFU"},
                    {kw:"list of ai cybersecurity tools",cat:"AI Cybersecurity",sv:2400,pos:'23',funnel:"BOFU"},
                    {kw:"aiops tools",cat:"AI Cybersecurity",sv:1900,pos:'31',funnel:"BOFU"},
                    {kw:"access control solutions",cat:"NAC",sv:1900,pos:null,funnel:"BOFU"},
                    {kw:"ai cybersecurity certification",cat:"AI Cybersecurity",sv:590,pos:null,funnel:"BOFU"},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                  ];
                  const FUNNEL_CFG = {
                    TOFU:{label:'TOFU',color:'#1A56DB',bg:'rgba(26,86,219,.07)',border:'rgba(26,86,219,.18)',hdr:'rgba(26,86,219,.1)'},
                    MOFU:{label:'MOFU',color:'#0E7490',bg:'rgba(6,182,212,.06)',border:'rgba(6,182,212,.18)',hdr:'rgba(6,182,212,.1)'},
                    BOFU:{label:'BOFU',color:'#7C3AED',bg:'rgba(124,58,237,.06)',border:'rgba(124,58,237,.18)',hdr:'rgba(124,58,237,.1)'},
                  };
                  const posColor = (pos:string|null) => {
                    if(!pos) return '#DC2626';
                    const n = parseInt(pos);
                    if(n===1) return '#059669';
                    if(n<=5)  return '#1A56DB';
                    if(n<=10) return '#B45309';
                    return '#DC2626';
                  };
                  return (
                    <div style={{display:'flex',flexDirection:'column',gap:0}}>
                      {/* Column headers */}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 110px 80px 56px 60px',gap:8,
                        padding:'5px 10px 7px',borderBottom:'2px solid var(--border)',marginBottom:4}}>
                        {['Keyword','Category','SV','Funnel','Position'].map((h,i)=>(
                          <span key={i} style={{fontSize:8,fontWeight:800,color:'var(--text3)',
                            textTransform:'uppercase',letterSpacing:'.07em',
                            textAlign:i>=2?'center':'left'}}>{h}</span>
                        ))}
                      </div>
                      {(['TOFU','MOFU','BOFU'] as const).map(funnel=>{
                        const fc = FUNNEL_CFG[funnel];
                        const rows = RISK_KWS.filter(r=>r.funnel===funnel);
                        return (
                          <div key={funnel} style={{marginBottom:10}}>
                            {/* Funnel section header */}
                            <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 10px',
                              background:fc.hdr,borderRadius:'6px 6px 0 0',borderBottom:`1px solid ${fc.border}`}}>
                              <span style={{width:6,height:6,borderRadius:'50%',background:fc.color,flexShrink:0}}/>
                              <span style={{fontSize:9,fontWeight:800,color:fc.color,
                                fontFamily:"'DM Mono',monospace",letterSpacing:'.07em'}}>{fc.label}</span>
                              <span style={{fontSize:9,color:fc.color,opacity:.7,marginLeft:2}}>
                                {rows.length} keywords · sorted by SV
                              </span>
                            </div>
                            {/* Keyword rows */}
                            {rows.map((r,i)=>(
                              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 110px 80px 56px 60px',
                                gap:8,padding:'8px 10px',alignItems:'center',
                                background:i%2===0?fc.bg:'transparent',
                                borderBottom:`1px solid ${fc.border}`,
                                borderRadius:i===rows.length-1?'0 0 6px 6px':0}}>
                                {/* Keyword */}
                                <span style={{fontSize:11,fontWeight:700,color:'var(--text)',
                                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.kw}</span>
                                {/* Category */}
                                <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,
                                  background:catColor(r.cat)+'14',color:catColor(r.cat),
                                  fontFamily:"'DM Mono',monospace",overflow:'hidden',textOverflow:'ellipsis',
                                  whiteSpace:'nowrap',textAlign:'center'}}>
                                  {r.cat.replace('Top Opportunities','Top Opps').replace('AI Cybersecurity','AI Cyber').replace('Quantum Security','Quantum')}
                                </span>
                                {/* SV */}
                                <span style={{fontSize:11,fontWeight:700,color:'var(--text3)',
                                  fontFamily:"'DM Mono',monospace",textAlign:'center'}}>
                                  {r.sv>=1000?`${(r.sv/1000).toFixed(r.sv>=100000?0:1)}K`:r.sv}
                                </span>
                                {/* Funnel badge */}
                                <span style={{fontSize:9,fontWeight:800,color:fc.color,
                                  background:fc.hdr,padding:'2px 5px',borderRadius:4,
                                  fontFamily:"'DM Mono',monospace",textAlign:'center'}}>{funnel}</span>
                                {/* Position */}
                                <div style={{display:'flex',justifyContent:'center'}}>
                                  {r.pos ? (
                                    <span style={{fontSize:10,fontWeight:900,color:posColor(r.pos),
                                      background:posColor(r.pos)+'14',border:`1px solid ${posColor(r.pos)}30`,
                                      padding:'2px 6px',borderRadius:5,fontFamily:"'DM Mono',monospace",
                                      minWidth:28,textAlign:'center'}}>#{r.pos}</span>
                                  ) : (
                                    <span style={{fontSize:9,fontWeight:800,color:'#DC2626',
                                      background:'rgba(220,38,38,.08)',border:'1px solid rgba(220,38,38,.2)',
<<<<<<< HEAD
                                      padding:'2px 5px',borderRadius:5,fontFamily:"'DM Mono',monospace"}}>101</span>
=======
                                      padding:'2px 5px',borderRadius:5,fontFamily:"'DM Mono',monospace"}}>NR</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

        </div>

        {/* old heatmap removed */}


        {/* ═══ EXPERT INSIGHTS — removed, see Top Risk tab ═══ */}
        <div style={{display:'none'}}>
          <div className="fn-grid2">
            <div>
              <div className="fn-insight-card fn-insight-green">
                <div className="fn-insight-label" style={{color:'var(--green)'}}>🏆 STRENGTH · NGFW Category Authority</div>
                <div className="fn-insight-title">Fortinet owns the NGFW SERP — categorically</div>
                <div className="fn-insight-text">
                  With <strong>105 of 141 NGFW keywords at Rank #1</strong> (74.5%), including permanent lock-ins like
                  <span className="fn-insight-metric">web application firewall</span>
                  <span className="fn-insight-metric">firewall rules</span>
                  <span className="fn-insight-metric">firewall configuration</span>
                  — these haven't budged from #1 for the entire 16-week period. The Cyberglossary is functioning as a true knowledge moat, not just content marketing.
                </div>
              </div>
              <div className="fn-insight-card fn-insight-cyan">
                <div className="fn-insight-label" style={{color:'var(--cyan)'}}>🚀 BREAKTHROUGH · The VPN Capture of 2026</div>
                <div className="fn-insight-title">673K monthly searches — from Rank 41 to Rank #1</div>
                <div className="fn-insight-text">
                  <strong>"vpn"</strong> is the single highest-impact SEO win in this dataset. Starting at
                  <span className="fn-insight-metric" style={{color:'var(--red)'}}>Rank 41</span> in Dec 2025,
                  it climbed to <span className="fn-insight-metric" style={{color:'var(--green)'}}>Rank #1</span> by Apr 2026 — a <strong>40-position improvement in 16 weeks</strong>. At 673K monthly searches, capturing the #1 position for this keyword alone could represent hundreds of thousands of monthly organic sessions.
                </div>
              </div>
              <div className="fn-insight-card fn-insight-purple">
                <div className="fn-insight-label" style={{color:'var(--purple)'}}>◈ INSIGHT · Zero Trust — Best Rank Consistency Score</div>
                <div className="fn-insight-title">Near-perfect stability at the lowest avg rank</div>
                <div className="fn-insight-text">
                  Zero Trust achieves <strong>Avg Rank 2.6</strong> across 20 keywords — the best of any category. Core terms like
                  <span className="fn-insight-metric">zero trust</span>
                  <span className="fn-insight-metric">ztna</span>
                  <span className="fn-insight-metric">zero trust architecture</span>
                  have been at Rank #1 for every single week tracked. The outlier is <strong>"zero trust security" (5.4K vol)</strong> oscillating between Rank 6–32 — the only crack in an otherwise perfect defensive wall.
                </div>
              </div>
              <div className="fn-insight-card fn-insight-amber">
                <div className="fn-insight-label" style={{color:'var(--amber)'}}>⚠ RISK · Zero Day — Biggest Volume Gap</div>
                <div className="fn-insight-title">368K searches, stuck at Rank 25</div>
                <div className="fn-insight-text">
                  <strong>"zero day"</strong> has <span className="fn-insight-metric">368,000 monthly searches</span> — the second-highest volume in the entire dataset — yet Fortinet is at <strong>Rank 25</strong>, declining with a <span className="fn-insight-metric" style={{color:'var(--red)'}}>−9 delta</span>. This is the most costly unaddressed gap. Moving from Rank 25 to top 5 on this keyword alone could rival dozens of smaller wins combined.
                </div>
              </div>
            </div>
            <div>
              <div className="fn-insight-card fn-insight-blue">
                <div className="fn-insight-label" style={{color:'var(--blue)'}}>📊 PATTERN · SD-WAN's Volume Paradox</div>
                <div className="fn-insight-title">Highest keyword count, highest avg rank — a maintenance challenge</div>
                <div className="fn-insight-text">
                  SD-WAN tracks the most keywords (130) and holds <strong>96 at Rank #1</strong>, but the avg rank of <span className="fn-insight-metric">5.0</span> is the worst of any category. The tail keywords — especially commercial/comparison terms like
                  <span className="fn-insight-metric">best sd wan vendors</span>
                  <span className="fn-insight-metric">sd wan comparison</span>
                  — are dragging the average.
                </div>
              </div>
              <div className="fn-insight-card fn-insight-red">
                <div className="fn-insight-label" style={{color:'var(--red)'}}>🔴 ALERT · SERP Volatility Cluster</div>
                <div className="fn-insight-title">4 high-volume terms showing dangerous instability</div>
                <div className="fn-insight-text">
                  Four keywords with 40K+ monthly volume show multi-position weekly swings:
                  <strong>"cybersecurity"</strong> (201K) ranges Rank 1–23 ·
                  <strong>"proxy"</strong> (201K) ranges Rank 1–20 ·
                  <strong>"malware"</strong> (40.5K) ranges Rank 1–26 ·
                  <strong>"phishing"</strong> (49.5K) ranges Rank 1–26.
                  Collectively these represent <strong>~493K monthly searches</strong> with no stable footing.
                </div>
              </div>
              <div className="fn-insight-card fn-insight-green">
                <div className="fn-insight-label" style={{color:'var(--green)'}}>💡 OPPORTUNITY · Search Volume Surge</div>
                <div className="fn-insight-title">3 keywords where search demand outpaced rankings</div>
                <div className="fn-insight-text">
                  Volume has exploded since 2021:
                  <span className="fn-insight-metric" style={{color:'var(--green)'}}>vpn +3,618%</span>
                  <span className="fn-insight-metric" style={{color:'var(--green)'}}>cybersecurity +806%</span>
                  <span className="fn-insight-metric" style={{color:'var(--green)'}}>ztna +815%</span>
                  These represent secular demand trends. Fortinet is winning on ztna and vpn — but the surge in "cybersecurity" volume (now 201K) while rank still oscillates 1–23 means demand is outpacing content freshness.
                </div>
              </div>
              <div className="fn-insight-card fn-insight-purple">
                <div className="fn-insight-label" style={{color:'var(--purple)'}}>🎯 BOFU · Commercial Keyword Distribution</div>
                <div className="fn-insight-title">NGFW dominates BOFU with 43 product-intent keywords</div>
                <div className="fn-insight-text">
                  Across all 9 categories, <strong>86 BOFU keywords (15.9%)</strong> land on product or solution pages — signalling commercial intent. NGFW leads with <span className="fn-insight-metric" style={{color:'var(--green)'}}>43 BOFU</span> (pricing pages, product pages, solution landing pages). SD-WAN has <span className="fn-insight-metric" style={{color:'var(--amber)'}}>17 BOFU</span> (vendor comparison, solutions). NAC and Zero Trust have minimal BOFU (<span className="fn-insight-metric">3</span> and <span className="fn-insight-metric">1</span> respectively). Top Opportunities has <strong>0 BOFU</strong> — all 47 ranked keywords are informational cyberglossary content, representing a pipeline gap for direct commercial conversion.
                </div>
              </div>
              <div className="fn-insight-card" style={{background:'rgba(14,116,144,.04)',borderColor:'rgba(14,116,144,.18)'}}>
                <div className="fn-insight-label" style={{color:'var(--cyan)'}}>🎯 STRATEGY · Where to focus next 90 days</div>
                <div className="fn-insight-title">Top 3 highest-ROI ranking opportunities</div>
                <div className="fn-insight-text">
                  <strong>1. Zero Day (368K vol, Rank 25):</strong> A dedicated, deeply-linked pillar page could realistically move into top 5.<br/><br/>
                  <strong>2. IAM / Identity (33K, volatile Rank 8–20):</strong> Internal linking restructure from NAC pages could stabilize rank.<br/><br/>
                  <strong>3. "access control solutions" (1.9K, high intent):</strong> Despite massive volatility (Rank 9–70), this commercial intent term would drive direct pipeline — worth a dedicated landing page test.
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="fn-card fn-full" style={{marginTop:4}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(10,122,85,.1)'}}>⏱</div>
              <span className="fn-card-title">SEO Performance Timeline — Key Milestones Dec 2025 → Apr 2026</span>
            </div>
            <div style={{padding:'6px 0'}}>
              {[
                {dot:{bg:'rgba(217,48,37,.08)',border:'rgba(217,48,37,.25)'},emoji:'📍',week:'WEEK 1 · Dec 31, 2025 — Baseline',text:<><strong>vpn</strong> starts at Rank 41 · <strong>NGFW</strong> begins with 103/141 at #1 · Zero Trust at 16/20 · Campaign baseline established across 419 keywords.</>},
                {dot:{bg:'rgba(26,86,219,.08)',border:'rgba(26,86,219,.25)'},emoji:'📈',week:'WEEKS 4-6 · Jan 21 – Feb 4 — VPN Surge Begins',text:<><strong>vpn</strong> climbs from Rank 33 → Rank 17. <strong>malware</strong> temporarily spikes to Rank 26 then recovers. NGFW maintains 95–103 keywords at #1.</>},
                {dot:{bg:'rgba(124,58,237,.08)',border:'rgba(124,58,237,.25)'},emoji:'⚡',week:'WEEKS 7-9 · Feb 11 – Feb 25 — SERP Flux Period',text:<>Highest volatility window: <strong>cybersecurity</strong> spikes to Rank 23 · <strong>iot</strong> drops to Rank 43 · <strong>phishing</strong> jumps to Rank 19. Industry-wide SERP reshuffle from possible algorithm update.</>},
                {dot:{bg:'rgba(10,122,85,.08)',border:'rgba(10,122,85,.25)'},emoji:'🏆',week:'WEEK 13 · Mar 25 — SD-WAN Peak',text:<>SD-WAN reaches its best week: <strong>96/130 keywords at Rank #1</strong> — highest SD-WAN count ever in this dataset. Sustained through Apr 8.</>},
                {dot:{bg:'rgba(10,122,85,.08)',border:'rgba(10,122,85,.3)'},emoji:'🎯',week:'WEEK 14-15 · Apr 1–8 — VPN Capture Complete',text:<><strong>vpn (673K)</strong> achieves Rank #1. <strong>cybersecurity (201K)</strong> hits Rank #1. <strong>NGFW</strong> reaches 105 keywords at #1 — best position of entire tracked period.</>},
                {dot:{bg:'rgba(26,86,219,.08)',border:'rgba(26,86,219,.3)'},emoji:'📊',week:'WEEK 16 · Apr 15, 2026 — Latest Update',text:<>New week data ingested from SEMrush. <strong>cybersecurity</strong> drops to Rank 23 (−22). <strong>saml</strong> improves to Rank #1 (+9). <strong>network firewalls</strong> holds Rank #1. Portfolio monitoring continues.</>}
              ].map((item,i)=>(
                <div key={i} className="fn-timeline-item">
                  <div className="fn-timeline-dot" style={{background:item.dot.bg,borderColor:item.dot.border}}>{item.emoji}</div>
                  <div className="fn-timeline-body">
                    <div className="fn-timeline-week">{item.week}</div>
                    <div className="fn-timeline-text">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expert Scorecard */}
          <div className="fn-card fn-full" style={{marginTop:14}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(26,86,219,.1)'}}>◈</div>
              <span className="fn-card-title">Expert SEO Position Assessment — Category Scorecard</span>
            </div>
            <div style={{overflowX:'auto'}}>
            <table className="fn-data-table">
              <thead><tr>
                <th>Category</th><th>Total KWs</th><th>Rank #1</th><th>Coverage</th><th>Avg Rank</th>
                <th style={{color:'var(--blue)'}}>TOFU/MOFU</th>
                <th style={{color:'var(--purple)'}}>BOFU</th>
                <th style={{color:'var(--red)'}}>Not Ranking</th>
                <th>Improving</th><th>Declining</th><th>Balance</th><th>Assessment</th>
              </tr></thead>
              <tbody>
                {['NGFW','SD-WAN','NAC','Zero Trust','Top Opportunities','AI Cybersecurity','OT Security','Quantum Security','SASE'].map(cat=>{
                  const s = CAT_STATS[cat];
                  const st = scorecardStatuses[cat];
                  const net = s.improving - s.declining;
                  const tofuPct = Math.round(s.tofu_mofu / s.total * 100);
                  const bofuPct = Math.round(s.bofu / s.total * 100);
                  const nrPct   = Math.round(s.not_ranking / s.total * 100);
                  return (
                    <tr key={cat}>
                      <td style={{fontWeight:800,color:catColor(cat)}}>{cat}</td>
                      <td style={{fontFamily:"'DM Mono',monospace",fontWeight:600}}>{s.total}</td>
                      <td style={{color:'var(--green)',fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{s.rank1}</td>
                      <td><span style={{background:s.pct>70?'rgba(10,122,85,.1)':s.pct>55?'rgba(180,83,9,.1)':'rgba(217,48,37,.1)',color:s.pct>70?'var(--green)':s.pct>55?'var(--amber)':'var(--red)',padding:'3px 10px',borderRadius:12,fontWeight:800,fontSize:11,fontFamily:"'DM Mono',monospace"}}>{s.pct}%</span></td>
                      <td style={{fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{s.avg_rank}</td>
                      <td>
                        <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
                          <span style={{fontWeight:800,fontFamily:"'DM Mono',monospace",color:'var(--blue)'}}>{s.tofu_mofu}</span>
                          <span style={{fontSize:9,color:'var(--text4)',fontFamily:"'DM Mono',monospace"}}>{tofuPct}%</span>
                        </span>
                      </td>
                      <td>
                        <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
                          <span style={{fontWeight:800,fontFamily:"'DM Mono',monospace",color:'var(--purple)'}}>{s.bofu}</span>
                          <span style={{fontSize:9,color:'var(--text4)',fontFamily:"'DM Mono',monospace"}}>{bofuPct}%</span>
                        </span>
                      </td>
                      <td>
                        <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
                          <span style={{fontWeight:800,fontFamily:"'DM Mono',monospace",color:s.not_ranking>0?'var(--red)':'var(--text4)'}}>{s.not_ranking}</span>
                          {s.not_ranking>0 && <span style={{fontSize:9,color:'var(--text4)',fontFamily:"'DM Mono',monospace"}}>{nrPct}%</span>}
                        </span>
                      </td>
                      <td style={{color:'var(--green)',fontWeight:800,fontFamily:"'DM Mono',monospace"}}>▲{s.improving}</td>
                      <td style={{color:'var(--red)',fontWeight:800,fontFamily:"'DM Mono',monospace"}}>▼{s.declining}</td>
                      <td style={{fontWeight:800,fontFamily:"'DM Mono',monospace",color:net>=0?'var(--green)':'var(--red)'}}>{net>=0?'+':''}{net}</td>
                      <td><span style={{background:'rgba(0,0,0,.05)',color:st.color,padding:'4px 12px',borderRadius:12,fontSize:11,fontWeight:800}}>{st.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Funnel Breakdown Chart */}
          <div className="fn-card fn-full" style={{marginTop:14}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(26,86,219,.08)'}}>◈</div>
              <span className="fn-card-title">Keyword Funnel Distribution — TOFU/MOFU vs BOFU vs Not Ranking by Category</span>
<<<<<<< HEAD
              <span className="fn-card-meta">Source: Latest Top Rank URL classification · Oct 07, 2026</span>
=======
              <span className="fn-card-meta">Source: Latest Top Rank URL classification · Sep 30, 2026</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            </div>
            <div className="fn-chart-wrap" style={{height:220}}><canvas id="funnelChart"></canvas></div>
            <div style={{display:'flex',gap:16,flexWrap:'wrap',marginTop:12,paddingTop:10,borderTop:'1.5px solid var(--border)'}}>
              {[
                {label:'TOFU/MOFU',color:'#1A56DB',desc:'Informational / Cyberglossary URLs — Awareness & Education'},
                {label:'BOFU',color:'#7C3AED',desc:'Product / Solution URLs — Commercial Intent'},
<<<<<<< HEAD
                {label:'Not Ranking',color:'#D93025',desc:'No position Oct 07, 2026 — Dropped off SERP'},
=======
                {label:'Not Ranking',color:'#D93025',desc:'No position Sep 30, 2026 — Dropped off SERP'},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              ].map((item,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:10,height:10,borderRadius:3,background:item.color,flexShrink:0}}></div>
                  <span style={{fontSize:10,fontWeight:700,color:'var(--text2)',fontFamily:"'DM Mono',monospace"}}>{item.label}</span>
                  <span style={{fontSize:10,color:'var(--text3)'}}>— {item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* ═══ GAIN & LOSS ═══ */}
        <div className={`fn-tab-panel${activeTab==='gainloss'?' active':''}`}>
<<<<<<< HEAD
          <TabHead eyebrow="07 — GAIN & LOSS" title="Gain & Loss" sub="Top gaining URLs and keywords behind the traffic movement" accent="#0E7490" onHome={()=>handleTabSwitch('home')} />
          <KeyInsights items={gainInsights} />

          {/* ── Branded Traffic (GSC) — Top Gaining URLs ── */}
          <div className="fn-card fn-full" style={{marginBottom:16}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(124,58,237,.08)'}}>🔍</div>
              <span className="fn-card-title">Branded Traffic (GSC) — Top Gaining URLs</span>
              <span className="fn-card-meta">Sep 20–Sep 26 vs Sep 27–Oct 03, 2026</span>
              <div style={{marginLeft:'auto',display:'flex',gap:16,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>WoW Change</div>
                  <div style={{fontSize:13,fontWeight:900,color:'#059669',fontFamily:"'DM Mono',monospace"}}>+1.61% <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>/ +2,008</span></div>
=======

          {/* ── /products (GA) — Top Losing URLs ── */}
          <div className="fn-card fn-full" style={{marginBottom:16}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(220,38,38,.08)'}}>🛍</div>
              <span className="fn-card-title">/products (GA) — Top Losing URLs</span>
              <span className="fn-card-meta">Sep 13–Sep 19 vs Sep 20–Sep 26, 2026</span>
              <div style={{marginLeft:'auto',display:'flex',gap:16,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>WoW Change</div>
                  <div style={{fontSize:13,fontWeight:900,color:'#DC2626',fontFamily:"'DM Mono',monospace"}}>-5.23% <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>/ -766</span></div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'6px 12px',marginBottom:2,borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>URL</span>
<<<<<<< HEAD
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 20–Sep 26</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 27–Oct 03</span>
=======
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 13–Sep 19</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 20–Sep 26</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Change</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>% Change</span>
            </div>
            {[
<<<<<<< HEAD
              {url:'fortinet.com/support/product-downloads',href:'https://www.fortinet.com/support/product-downloads', prev:'37,171', curr:'37,286', chg:'+115', pct:'+0.3%'},
              {url:'fortinet.com/products/email-security',href:'https://www.fortinet.com/products/email-security', prev:'157', curr:'259', chg:'+102', pct:'+65.0%'},
              {url:'fortinet.com/products/endpoint-security/forticlient',href:'https://www.fortinet.com/products/endpoint-security/forticlient', prev:'947', curr:'1,044', chg:'+97', pct:'+10.2%'},
=======
              {url:'fortinet.com/…/fortigate/fortios',href:'https://www.fortinet.com/products/fortigate/fortios', prev:'187', curr:'160', chg:'-27', pct:'-14.4%'},
              {url:'fortinet.com/products/fortimonitor',href:'https://www.fortinet.com/products/fortimonitor', prev:'53', curr:'28', chg:'-25', pct:'-47.2%'},
              {url:'fortinet.com/…/smallbusiness/fortimanagement-cloud',href:'https://www.fortinet.com/products/smallbusiness/fortimanagement-cloud', prev:'103', curr:'82', chg:'-21', pct:'-20.4%'},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            ].map((r,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
                borderRadius:7,background:i%2===0?'var(--surface2)':'transparent',marginBottom:4,alignItems:'center'}}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:700,color:'#1A56DB',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Mono',monospace",textDecoration:'none',display:'block',cursor:'pointer'}}>{r.url}</a>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.prev}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.curr}</span>
<<<<<<< HEAD
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
=======
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
              borderTop:'2px solid var(--border)',marginTop:4,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Top 3 Total</span>
<<<<<<< HEAD
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>38,275</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>38,589</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+314</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+0.8%</span>
=======
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>343</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>270</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-73</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-21.3%</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            </div>
            <div style={{marginTop:12,marginBottom:6,padding:'6px 12px'}}>
              <span style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em'}}>International Markets</span>
            </div>
            {[
<<<<<<< HEAD
              {url:'fortinet.com/lat/support/product-downloads',href:'https://www.fortinet.com/lat/support/product-downloads', prev:'10,883', curr:'11,817', chg:'+934', pct:'+8.6%'},
              {url:'fortinet.com/jp/support/product-downloads',href:'https://www.fortinet.com/jp/support/product-downloads', prev:'636', curr:'1,203', chg:'+567', pct:'+89.2%'},
              {url:'fortinet.com/jp/products/next-generation-firewall',href:'https://www.fortinet.com/jp/products/next-generation-firewall', prev:'179', curr:'434', chg:'+255', pct:'+142.5%'},
=======
              {url:'fortinet.com/…/products/next-generation-firewall',href:'https://www.fortinet.com/jp/products/next-generation-firewall', prev:'782', curr:'308', chg:'-474', pct:'-60.6%'},
              {url:'fortinet.com/…/products/ethernet-switches',href:'https://www.fortinet.com/jp/products/ethernet-switches', prev:'153', curr:'49', chg:'-104', pct:'-68.0%'},
              {url:'fortinet.com/jp/products',href:'https://www.fortinet.com/jp/products', prev:'167', curr:'78', chg:'-89', pct:'-53.3%'},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            ].map((r,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
                borderRadius:7,background:i%2===0?'var(--surface2)':'transparent',marginBottom:4,alignItems:'center'}}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:700,color:'#1A56DB',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Mono',monospace",textDecoration:'none',display:'block',cursor:'pointer'}}>{r.url}</a>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.prev}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.curr}</span>
<<<<<<< HEAD
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
=======
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
              borderTop:'2px solid var(--border)',marginTop:4,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Int'l Top 3 Total</span>
<<<<<<< HEAD
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>11,698</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>13,454</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+1,756</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+15.0%</span>
            </div>
          </div>


          {/* ── Branded Traffic (GSC) — Top Gaining Keywords ── */}
          <div className="fn-card fn-full" style={{marginBottom:16}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(124,58,237,.08)'}}>🔑</div>
              <span className="fn-card-title">Branded Traffic (GSC) — Top Gaining Keywords</span>
              <span className="fn-card-meta">Sep 20–Sep 26 vs Sep 27–Oct 03, 2026</span>
              <div style={{marginLeft:'auto',display:'flex',gap:16,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>WoW Change</div>
                  <div style={{fontSize:13,fontWeight:900,color:'#059669',fontFamily:"'DM Mono',monospace"}}>+1.61% <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>/ +2,008</span></div>
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'6px 12px',marginBottom:2,borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Keyword</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 20–Sep 26</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 27–Oct 03</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Change</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>% Change</span>
            </div>
            {[
              {kw:'fortimail', prev:'217', curr:'376', chg:'+159', pct:'+73.3%'},
              {kw:'fortinet', prev:'11,060', curr:'11,216', chg:'+156', pct:'+1.4%'},
              {kw:'fortinet vpn', prev:'1,327', curr:'1,479', chg:'+152', pct:'+11.5%'},
            ].map((r,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
                borderRadius:7,background:i%2===0?'var(--surface2)':'transparent',marginBottom:4,alignItems:'center'}}>
                <span style={{fontSize:11,fontWeight:700,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Mono',monospace"}}>{r.kw}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.prev}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.curr}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
              borderTop:'2px solid var(--border)',marginTop:4,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Top 3 Total</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>12,604</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>13,071</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+467</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+3.7%</span>
            </div>
            <div style={{marginTop:12,marginBottom:6,padding:'6px 12px'}}>
              <span style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em'}}>International Keywords</span>
            </div>
            {[
              {kw:'forticlient vpn', prev:'14,357', curr:'15,280', chg:'+923', pct:'+6.4%'},
              {kw:'forticlient', prev:'12,352', curr:'13,146', chg:'+794', pct:'+6.4%'},
            ].map((r,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
                borderRadius:7,background:i%2===0?'var(--surface2)':'transparent',marginBottom:4,alignItems:'center'}}>
                <span style={{fontSize:11,fontWeight:700,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Mono',monospace"}}>{r.kw}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.prev}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.curr}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
              borderTop:'2px solid var(--border)',marginTop:4,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Int'l Top 2 Total</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>26,709</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>28,426</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+1,717</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+6.4%</span>
            </div>
          </div>


          {/* ── /products (GA) — Top Gaining URLs ── */}
          <div className="fn-card fn-full" style={{marginBottom:16}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(5,150,105,.08)'}}>🛍</div>
              <span className="fn-card-title">/products (GA) — Top Gaining URLs</span>
              <span className="fn-card-meta">Sep 20–Sep 26 vs Sep 27–Oct 03, 2026</span>
              <div style={{marginLeft:'auto',display:'flex',gap:16,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>WoW Change</div>
                  <div style={{fontSize:13,fontWeight:900,color:'#059669',fontFamily:"'DM Mono',monospace"}}>+5.41% <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>/ +752</span></div>
=======
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>1,102</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>435</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-667</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-60.5%</span>
            </div>
          </div>

          {/* ── /about-us (GA) — Top Losing URLs ── */}
          <div className="fn-card fn-full" style={{marginBottom:16}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(220,38,38,.08)'}}>🏢</div>
              <span className="fn-card-title">/about-us (GA) — Top Losing URLs</span>
              <span className="fn-card-meta">Sep 13–Sep 19 vs Sep 20–Sep 26, 2026</span>
              <div style={{marginLeft:'auto',display:'flex',gap:16,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>WoW Change</div>
                  <div style={{fontSize:13,fontWeight:900,color:'#DC2626',fontFamily:"'DM Mono',monospace"}}>-11.62% <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>/ -605</span></div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'6px 12px',marginBottom:2,borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>URL</span>
<<<<<<< HEAD
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 20–Sep 26</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 27–Oct 03</span>
=======
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 13–Sep 19</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 20–Sep 26</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Change</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>% Change</span>
            </div>
            {[
<<<<<<< HEAD
              {url:'fortinet.com/products/email-security',href:'https://www.fortinet.com/products/email-security', prev:'153', curr:'203', chg:'+50', pct:'+32.7%'},
              {url:'fortinet.com/products/endpoint-security/forticlient',href:'https://www.fortinet.com/products/endpoint-security/forticlient', prev:'1,850', curr:'1,889', chg:'+39', pct:'+2.1%'},
              {url:'fortinet.com/products/fortiaigate',href:'https://www.fortinet.com/products/fortiaigate', prev:'130', curr:'154', chg:'+24', pct:'+18.5%'},
=======
              {url:'fortinet.com/…/events/sase-summit',href:'https://www.fortinet.com/corporate/about-us/events/events/sase-summit', prev:'173', curr:'23', chg:'-150', pct:'-86.7%'},
              {url:'fortinet.com/…/about-us/about-us',href:'https://www.fortinet.com/corporate/about-us/about-us', prev:'195', curr:'159', chg:'-36', pct:'-18.5%'},
              {url:'fortinet.com/…/2026/fortinet-unveils-new-calgary-cybersecurity-inno…',href:'https://www.fortinet.com/corporate/about-us/newsroom/press-releases/2026/fortinet-unveils-new-calgary-cybersecurity-innovation-hub', prev:'42', curr:'10', chg:'-32', pct:'-76.2%'},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            ].map((r,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
                borderRadius:7,background:i%2===0?'var(--surface2)':'transparent',marginBottom:4,alignItems:'center'}}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:700,color:'#1A56DB',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Mono',monospace",textDecoration:'none',display:'block',cursor:'pointer'}}>{r.url}</a>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.prev}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.curr}</span>
<<<<<<< HEAD
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
=======
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
              borderTop:'2px solid var(--border)',marginTop:4,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Top 3 Total</span>
<<<<<<< HEAD
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>2,133</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>2,246</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+113</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+5.3%</span>
=======
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>410</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>192</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-218</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-53.2%</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            </div>
            <div style={{marginTop:12,marginBottom:6,padding:'6px 12px'}}>
              <span style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em'}}>International Markets</span>
            </div>
            {[
<<<<<<< HEAD
              {url:'fortinet.com/jp/products/next-generation-firewall',href:'https://www.fortinet.com/jp/products/next-generation-firewall', prev:'308', curr:'713', chg:'+405', pct:'+131.5%'},
              {url:'fortinet.com/jp/products',href:'https://www.fortinet.com/jp/products', prev:'78', curr:'178', chg:'+100', pct:'+128.2%'},
              {url:'fortinet.com/jp/products/email-security',href:'https://www.fortinet.com/jp/products/email-security', prev:'19', curr:'81', chg:'+62', pct:'+326.3%'},
=======
              {url:'fortinet.com/…/about-us/company',href:'https://www.fortinet.com/jp/corporate/about-us/company', prev:'254', curr:'138', chg:'-116', pct:'-45.7%'},
              {url:'fortinet.com/…/about-us/about-us',href:'https://www.fortinet.com/jp/corporate/about-us/about-us', prev:'119', curr:'72', chg:'-47', pct:'-39.5%'},
              {url:'fortinet.com/…/about-us/contact-us',href:'https://www.fortinet.com/jp/corporate/about-us/contact-us', prev:'80', curr:'33', chg:'-47', pct:'-58.8%'},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            ].map((r,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
                borderRadius:7,background:i%2===0?'var(--surface2)':'transparent',marginBottom:4,alignItems:'center'}}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:700,color:'#1A56DB',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Mono',monospace",textDecoration:'none',display:'block',cursor:'pointer'}}>{r.url}</a>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.prev}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.curr}</span>
<<<<<<< HEAD
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
              borderTop:'2px solid var(--border)',marginTop:4,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Int'l Top 3 Total</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>405</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>972</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+567</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+140.0%</span>
            </div>
          </div>


          {/* ── /about-us (GA) — Top Gaining URLs ── */}
          <div className="fn-card fn-full" style={{marginBottom:16}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(5,150,105,.08)'}}>🏢</div>
              <span className="fn-card-title">/about-us (GA) — Top Gaining URLs</span>
              <span className="fn-card-meta">Sep 20–Sep 26 vs Sep 27–Oct 03, 2026</span>
              <div style={{marginLeft:'auto',display:'flex',gap:16,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>WoW Change</div>
                  <div style={{fontSize:13,fontWeight:900,color:'#059669',fontFamily:"'DM Mono',monospace"}}>+6.52% <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>/ +300</span></div>
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'6px 12px',marginBottom:2,borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>URL</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 20–Sep 26</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 27–Oct 03</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Change</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>% Change</span>
            </div>
            {[
              {url:'fortinet.com/…/events/secops-summit',href:'https://www.fortinet.com/corporate/about-us/events/events/secops-summit', prev:'2', curr:'34', chg:'+32', pct:'+1600.0%'},
              {url:'fortinet.com/corporate/about-us/legal',href:'https://www.fortinet.com/corporate/about-us/legal', prev:'291', curr:'319', chg:'+28', pct:'+9.6%'},
              {url:'fortinet.com/corporate/about-us/about-us',href:'https://www.fortinet.com/corporate/about-us/about-us', prev:'159', curr:'178', chg:'+19', pct:'+11.9%'},
            ].map((r,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
                borderRadius:7,background:i%2===0?'var(--surface2)':'transparent',marginBottom:4,alignItems:'center'}}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:700,color:'#1A56DB',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Mono',monospace",textDecoration:'none',display:'block',cursor:'pointer'}}>{r.url}</a>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.prev}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.curr}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
              borderTop:'2px solid var(--border)',marginTop:4,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Top 3 Total</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>452</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>531</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+79</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+17.5%</span>
            </div>
            <div style={{marginTop:12,marginBottom:6,padding:'6px 12px'}}>
              <span style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em'}}>International Markets</span>
            </div>
            {[
              {url:'fortinet.com/…/about-us/company',href:'https://www.fortinet.com/jp/corporate/about-us/company', prev:'138', curr:'218', chg:'+80', pct:'+58.0%'},
              {url:'fortinet.com/…/about-us/about-us',href:'https://www.fortinet.com/jp/corporate/about-us/about-us', prev:'72', curr:'105', chg:'+33', pct:'+45.8%'},
              {url:'fortinet.com/…/about-us/contact-us',href:'https://www.fortinet.com/jp/corporate/about-us/contact-us', prev:'33', curr:'66', chg:'+33', pct:'+100.0%'},
            ].map((r,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
                borderRadius:7,background:i%2===0?'var(--surface2)':'transparent',marginBottom:4,alignItems:'center'}}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:700,color:'#1A56DB',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Mono',monospace",textDecoration:'none',display:'block',cursor:'pointer'}}>{r.url}</a>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.prev}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.curr}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
=======
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
              borderTop:'2px solid var(--border)',marginTop:4,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Int'l Top 3 Total</span>
<<<<<<< HEAD
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>243</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>389</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+146</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+60.1%</span>
            </div>
          </div>


          {/* ── Direct (Relevant traffic) — Top Gaining URLs ── */}
          <div className="fn-card fn-full" style={{marginBottom:16}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(5,150,105,.08)'}}>🎯</div>
              <span className="fn-card-title">Direct (Relevant traffic) — Top Gaining URLs</span>
              <span className="fn-card-meta">Sep 20–Sep 26 vs Sep 27–Oct 03, 2026</span>
              <div style={{marginLeft:'auto',display:'flex',gap:16,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>WoW Change</div>
                  <div style={{fontSize:13,fontWeight:900,color:'#059669',fontFamily:"'DM Mono',monospace"}}>+8.59% <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>/ +7,234</span></div>
=======
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>453</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>243</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-210</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-46.4%</span>
            </div>
          </div>

          {/* ── Direct (Relevant traffic) — Top Losing URLs ── */}
          <div className="fn-card fn-full" style={{marginBottom:16}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(220,38,38,.08)'}}>🎯</div>
              <span className="fn-card-title">Direct (Relevant traffic) — Top Losing URLs</span>
              <span className="fn-card-meta">Sep 13–Sep 19 vs Sep 20–Sep 26, 2026</span>
              <div style={{marginLeft:'auto',display:'flex',gap:16,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>WoW Change</div>
                  <div style={{fontSize:13,fontWeight:900,color:'#DC2626',fontFamily:"'DM Mono',monospace"}}>-5.65% <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>/ -5,047</span></div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'6px 12px',marginBottom:2,borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>URL</span>
<<<<<<< HEAD
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 20–Sep 26</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 27–Oct 03</span>
=======
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 13–Sep 19</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 20–Sep 26</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Change</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>% Change</span>
            </div>
            {[
<<<<<<< HEAD
              {url:'fortinet.com/',href:'https://www.fortinet.com/', prev:'18,977', curr:'21,532', chg:'+2,555', pct:'+13.5%'},
              {url:'fortinet.com/support/product-downloads',href:'https://www.fortinet.com/support/product-downloads', prev:'12,309', curr:'13,568', chg:'+1,259', pct:'+10.2%'},
              {url:'fortinet.com/resources/analyst-reports/gartner-magic-quadrant-hmf',href:'https://www.fortinet.com/resources/analyst-reports/gartner-magic-quadrant-hmf', prev:'526', curr:'1,256', chg:'+730', pct:'+138.8%'},
=======
              {url:'fortinet.com/',href:'https://www.fortinet.com/', prev:'21,222', curr:'18,977', chg:'-2,245', pct:'-10.6%'},
              {url:'fortinet.com/sase-summit',href:'https://www.fortinet.com/sase-summit', prev:'540', curr:'35', chg:'-505', pct:'-93.5%'},
              {url:'fortinet.com/…/threat-research/casbaneiro-a-banking-trojan-with-dis…',href:'https://www.fortinet.com/blog/threat-research/casbaneiro-a-banking-trojan-with-distributed-data-receiving-servers', prev:'261', curr:'66', chg:'-195', pct:'-74.7%'},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            ].map((r,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
                borderRadius:7,background:i%2===0?'var(--surface2)':'transparent',marginBottom:4,alignItems:'center'}}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:700,color:'#1A56DB',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Mono',monospace",textDecoration:'none',display:'block',cursor:'pointer'}}>{r.url}</a>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.prev}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.curr}</span>
<<<<<<< HEAD
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
=======
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
              borderTop:'2px solid var(--border)',marginTop:4,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Top 3 Total</span>
<<<<<<< HEAD
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>31,812</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>36,356</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+4,544</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+14.3%</span>
            </div>
          </div>


          {/* ── Referrals (GA) — Top Gaining URLs ── */}
          <div className="fn-card fn-full" style={{marginBottom:16}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(5,150,105,.08)'}}>🔗</div>
              <span className="fn-card-title">Referrals (GA) — Top Gaining URLs</span>
              <span className="fn-card-meta">Sep 20–Sep 26 vs Sep 27–Oct 03, 2026</span>
              <div style={{marginLeft:'auto',display:'flex',gap:16,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>WoW Change</div>
                  <div style={{fontSize:13,fontWeight:900,color:'#059669',fontFamily:"'DM Mono',monospace"}}>+71.12% <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>/ +7,728</span></div>
=======
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>22,023</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>19,078</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-2,945</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-13.4%</span>
            </div>
          </div>

          {/* ── Referrals (GA) — Top Losing URLs ── */}
          <div className="fn-card fn-full" style={{marginBottom:16}}>
            <div className="fn-card-head">
              <div className="fn-card-icon" style={{background:'rgba(220,38,38,.08)'}}>🔗</div>
              <span className="fn-card-title">Referrals (GA) — Top Losing URLs</span>
              <span className="fn-card-meta">Sep 13–Sep 19 vs Sep 20–Sep 26, 2026</span>
              <div style={{marginLeft:'auto',display:'flex',gap:16,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>WoW Change</div>
                  <div style={{fontSize:13,fontWeight:900,color:'#DC2626',fontFamily:"'DM Mono',monospace"}}>-8.24% <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>/ -976</span></div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'6px 12px',marginBottom:2,borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em'}}>URL</span>
<<<<<<< HEAD
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 20–Sep 26</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 27–Oct 03</span>
=======
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 13–Sep 19</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Sep 20–Sep 26</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>Change</span>
              <span style={{fontSize:8,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'right'}}>% Change</span>
            </div>
            {[
<<<<<<< HEAD
              {url:'fortinet.com/library/gtm/cloud',href:'https://www.fortinet.com/library/gtm/cloud', prev:'283', curr:'2,919', chg:'+2,636', pct:'+931.4%'},
              {url:'fortinet.com/library/gtm/secops',href:'https://www.fortinet.com/library/gtm/secops', prev:'326', curr:'2,016', chg:'+1,690', pct:'+518.4%'},
              {url:'fortinet.com/library/gtm',href:'https://www.fortinet.com/library/gtm', prev:'351', curr:'2,024', chg:'+1,673', pct:'+476.6%'},
=======
              {url:'fortinet.com/…/sase-dgt/ai-sase-for-dummies',href:'https://www.fortinet.com/library/sase-dgt/ai-sase-for-dummies', prev:'636', curr:'35', chg:'-601', pct:'-94.5%'},
              {url:'fortinet.com/…/sase-dgt/ai-and-sase-in',href:'https://www.fortinet.com/library/sase-dgt/ai-and-sase-in', prev:'360', curr:'19', chg:'-341', pct:'-94.7%'},
              {url:'fortinet.com/…/sase-dgt/ai-and-sase-wp',href:'https://www.fortinet.com/library/sase-dgt/ai-and-sase-wp', prev:'293', curr:'21', chg:'-272', pct:'-92.8%'},
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            ].map((r,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
                borderRadius:7,background:i%2===0?'var(--surface2)':'transparent',marginBottom:4,alignItems:'center'}}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:700,color:'#1A56DB',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Mono',monospace",textDecoration:'none',display:'block',cursor:'pointer'}}>{r.url}</a>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.prev}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.curr}</span>
<<<<<<< HEAD
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
=======
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.chg}</span>
                <span style={{fontSize:12,fontWeight:800,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>{r.pct}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 90px 90px',gap:8,padding:'9px 12px',
              borderTop:'2px solid var(--border)',marginTop:4,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Top 3 Total</span>
<<<<<<< HEAD
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>960</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>6,959</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+5,999</span>
              <span style={{fontSize:13,fontWeight:900,color:'#059669',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>+624.9%</span>
=======
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>1,289</span>
              <span style={{fontSize:13,fontWeight:900,color:'var(--text)',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>75</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-1,214</span>
              <span style={{fontSize:13,fontWeight:900,color:'#DC2626',textAlign:'right',fontFamily:"'DM Mono',monospace"}}>-94.2%</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            </div>
          </div>

        </div>
<<<<<<< HEAD
        {/* ═══ TRAFFIC OVERVIEW ═══ */}
        <div className={`fn-tab-panel${activeTab==='traffic'?' active':''}`}>
          <TabHead eyebrow="01 — TRAFFIC OVERVIEW" title="Traffic Overview" sub="Organic search and site traffic from GSC and GA" accent="#0A7A55" onHome={()=>handleTabSwitch('home')} />
          <KeyInsights items={trafficInsights} />
=======

        {/* ═══ KEY TAKEAWAYS ═══ */}
        <div className={`fn-tab-panel${activeTab==='takeaways'?' active':''}`}>

          {/* Header */}
          <div style={{marginBottom:28}}>
            <div style={{fontSize:32,fontWeight:900,color:'#0F172A',letterSpacing:'-.5px',lineHeight:1.1,marginBottom:6}}>Key Takeaways</div>
            <div style={{fontSize:13,color:'#64748B',fontWeight:500,letterSpacing:'.01em'}}>
              Strategic Summary &nbsp;·&nbsp; Dec 31, 2025 → Sep 30, 2026 &nbsp;·&nbsp; 40-Week Analysis &nbsp;·&nbsp; 660 Keywords · 9 Categories · GSC + GA + Ranking Data
            </div>
          </div>

          {(()=>{
            const C = {
              pos:   {icon:'✓', color:'#059669', bg:'rgba(5,150,105,.08)'},
              neu:   {icon:'–', color:'#64748B', bg:'rgba(100,116,139,.08)'},
              mon:   {icon:'⚠', color:'#B45309', bg:'rgba(251,191,36,.06)'},
              crit:  {icon:'⊗', color:'#DC2626', bg:'rgba(220,38,38,.04)'},
            };
            type Status = keyof typeof C;
            type Row = {status: Status; text: JSX.Element};
            function InsightRow({status,text}:Row){
              const s = C[status];
              return (
                <div style={{display:'flex',gap:10,alignItems:'flex-start',
                  ...(status==='mon'||status==='crit'?{background:s.bg,borderRadius:8,padding:'8px 10px',margin:'0 -2px'}:{})}}>
                  <span style={{fontSize:15,color:s.color,flexShrink:0,lineHeight:1.3,fontWeight:700}}>{s.icon}</span>
                  <span style={{fontSize:12,color:status==='crit'?s.color:status==='mon'?'#92400E':'#1E293B',lineHeight:1.55,fontWeight:status==='crit'?600:400}}>{text}</span>
                </div>
              );
            }
            function Card({accentColor,icon,label,rows}:{accentColor:string;icon:string;label:string;rows:Row[]}){
              return (
                <div style={{background:'#fff',borderRadius:14,border:'1px solid #E2E8F0',borderLeft:`4px solid ${accentColor}`,padding:'20px 20px 18px',display:'flex',flexDirection:'column',gap:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,paddingBottom:14,borderBottom:'1px solid #F1F5F9'}}>
                    <div style={{width:34,height:34,borderRadius:10,background:`rgba(0,0,0,.04)`,border:`1px solid ${accentColor}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{icon}</div>
                    <span style={{fontSize:11,fontWeight:800,color:accentColor,letterSpacing:'.1em',textTransform:'uppercase'}}>{label}</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {rows.map((r,i)=><InsightRow key={i} {...r}/>)}
                  </div>
                </div>
              );
            }
            return (
              <>
                {/* 3×2 Grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>

                  {/* ── CARD 1: TRAFFIC OVERVIEW ── */}
                  <Card accentColor="#1A56DB" icon="📈" label="Traffic Overview" rows={[
                    {status:'mon', text:<><strong>All Organic (GSC) −0.81% / −2,326 WoW</strong> to 283,336 (Sep 23 → Sep 30). Branded +1.18% / +1,455 (124,744); Non-Branded −0.74% / −374 (50,195).</>},
                    {status:'crit', text:<><strong>GA page declines across the board.</strong> /about-us −11.62% / −605, /blog −11.21% / −253, /solutions −8.32% / −228, /products −5.23% / −766, /cyberglossary −2.45% / −838. Only /home page grew: +3.21% / +211.</>},
                    {status:'mon', text:<><strong>Direct (GA) +11.27% / +11,065 WoW, but relevant Direct −5.65% / −5,047.</strong> Referrals −8.24% / −976 (10,866). Growth in raw Direct is not reflected in validated traffic.</>},
                  ]}/>

                  {/* ── CARD 2: TOP RISK ── */}
                  <Card accentColor="#DC2626" icon="⚠" label="Top Risk" rows={[
                    {status:'crit', text:<><strong>"cybersecurity" (201K SV) fell from Rank #1 to NR.</strong> "zero day" (368K SV) remains NR since its Dec 31 baseline of Rank #14 — 569K SV combined now outside the SERP. Highest-priority content authority gap.</>},
                    {status:'crit', text:<><strong>"vpn" (673K SV) at Rank #12 — highest-volume at-risk keyword.</strong> Up from #13 WoW and from #41 baseline, now 2 positions from Page 1. Full Page 1 recapture would be the largest single-keyword organic win available.</>},
                    {status:'mon', text:<><strong>85 keywords NR on Sep 30 (12.9% portfolio, prev 79).</strong> 18 keywords dropped to NR this week vs 12 recovered. 23 of the NR set were ranked on Dec 31; total decliners since Dec 31: 128 keywords.</>},
                  ]}/>

                  {/* ── CARD 3: POSITION OVERVIEW ── */}
                  <Card accentColor="#059669" icon="◫" label="Position Overview" rows={[
                    {status:'crit', text:<><strong>318 of 660 keywords at Rank #1 (48.2%)</strong> on Sep 30, down from 373 (−14.7% WoW). Page 1 487 (73.8%) vs 497 prev. SASE strongest: 23/30 at Rank #1 (77%), avg rank 1.8, 27/30 on Page 1 (90%).</>},
                    {status:'mon', text:<><strong>NGFW 91/141 at Rank #1 (65%)</strong>, 130/141 Page 1 (92%), avg rank 3.3. NAC 49/80 at Rank #1 (61%), 73/80 Page 1 (91%), avg rank 2.5. SD-WAN 54/130 at Rank #1 (42%), avg rank 5.5.</>},
                    {status:'crit', text:<><strong>AI Cybersecurity weakest position profile:</strong> avg rank 8.3, only 37/136 at Rank #1 (27%), 62/136 Page 1 (46%), 47 NR. Top Opportunities avg rank 9.6 — 16/49 at Rank #1 (33%), 26/49 Page 1 (53%).</>},
                  ]}/>

                  {/* ── CARD 4: KEYWORD RANKING HEALTH ── */}
                  <Card accentColor="#7C3AED" icon="🏥" label="Keyword Ranking Health" rows={[
                    {status:'pos', text:<><strong>"phishing" (49.5K SV) recovered Rank #67 → #26 WoW (+41).</strong> Also "malware definition" #17 → #1, "what is ddos" #22 → #1, "vpn" #13 → #12. Still 14 positions below its Dec 31 baseline of Rank #12.</>},
                    {status:'crit', text:<><strong>Big-volume slips WoW:</strong> "cybersecurity" (201K SV) #1 → NR, "proxy" (201K SV) #3 → #21, "wan" (33.1K SV) #1 → #21, "network firewall" (3.6K SV) #1 → #17.</>},
                    {status:'mon', text:<><strong>Zero Trust weakened WoW:</strong> 1 improving vs 8 declining. "zero trust" (9.9K SV) #10 → #17, "ztna" #1 → #4. 11/20 at Rank #1 (55%), avg rank 5.5; no NR keywords in this category.</>},
                  ]}/>

                  {/* ── CARD 5: GAIN & LOSS ── */}
                  <Card accentColor="#D97706" icon="📊" label="Gain & Loss" rows={[
                    {status:'crit', text:<><strong>Referrals: SASE library pages collapsed (Sep 13–19 → Sep 20–26).</strong> ai-sase-for-dummies 636 → 35 (−94.5%), ai-and-sase-in 360 → 19, ai-and-sase-wp 293 → 21; top-3 total −1,214 (−94.2%).</>},
                    {status:'crit', text:<><strong>Direct relevant top-3 −2,945 (−13.4%).</strong> fortinet.com/ −2,245 (−10.6%), /sase-summit −505 (−93.5%), casbaneiro blog post −195 (−74.7%).</>},
                    {status:'mon', text:<><strong>/products top-3 −73 (−21.3%); JP products top-3 −667 (−60.5%).</strong> JP NGFW page −474 (−60.6%). /about-us top-3 −218 (−53.2%), led by the sase-summit events page −150 (−86.7%).</>},
                  ]}/>

                  {/* ── CARD 6: BY CATEGORY / BACKLINK DATA ── */}
                  <Card accentColor="#EC4899" icon="🔗" label="By Category / Backlink View" rows={[
                    {status:'crit', text:<><strong>Only 2 of 9 categories net positive WoW:</strong> NAC 21 gaining vs 13 declining (net +8) and AI Cybersecurity 34 vs 30 (net +4). SD-WAN worst: 22 vs 45, net −23. NGFW 22 vs 33, net −11.</>},
                    {status:'mon', text:<><strong>96.2% of portfolio (635/660) has no backlink support.</strong> 25 backlink-supported KWs: 14 at Rank #1 (56%) vs 304 of 635 (48%) without backlinks.</>},
                    {status:'crit', text:<><strong>Top Opportunities: 12 gaining vs 21 declining, net −9.</strong> Zero Trust net −7, OT Security net −7, SASE net −4. AI Cybersecurity keeps the largest at-risk pool: 30 declining · 47 NR on Sep 30.</>},
                  ]}/>

                </div>

                {/* Status Legend */}
                <div style={{display:'flex',justifyContent:'center',gap:24,marginBottom:28,padding:'10px 0',borderTop:'1px solid #F1F5F9',borderBottom:'1px solid #F1F5F9'}}>
                  {([['pos','POSITIVE'],['neu','NEUTRAL'],['mon','MONITOR'],['crit','CRITICAL GAP']] as [Status,string][]).map(([k,label])=>(
                    <div key={label} style={{display:'flex',alignItems:'center',gap:7}}>
                      <div style={{width:22,height:22,borderRadius:'50%',background:C[k].bg,border:`1.5px solid ${C[k].color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:C[k].color,fontWeight:800}}>{C[k].icon}</div>
                      <span style={{fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'.08em'}}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Top 3 Action Priorities */}
                <div style={{marginBottom:8}}>
                  <div style={{textAlign:'center',fontSize:10,fontWeight:800,color:'#94A3B8',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:14}}>TOP 3 ACTION PRIORITIES</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>

                    {/* Priority 1 */}
                    <div style={{background:'linear-gradient(135deg,rgba(220,38,38,.04) 0%,rgba(220,38,38,.02) 100%)',border:'1.5px solid rgba(220,38,38,.2)',borderRadius:14,padding:'18px 18px 16px',display:'flex',gap:14,alignItems:'flex-start'}}>
                      <div style={{width:40,height:40,borderRadius:12,background:'#DC2626',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>⚡</div>
                      <div>
                        <span style={{fontSize:9,fontWeight:800,color:'#DC2626',letterSpacing:'.1em',textTransform:'uppercase',display:'block',marginBottom:4}}>Priority 1</span>
                        <div style={{fontSize:14,fontWeight:800,color:'#0F172A',marginBottom:6,lineHeight:1.3}}>Recover "cybersecurity" — Rank #1 to NR</div>
                        <div style={{fontSize:11,color:'#475569',lineHeight:1.6,marginBottom:8}}>Top Risk tab shows "cybersecurity" (201K SV) dropped from Rank #1 to NR on Sep 30, while "zero day" (368K SV) remains NR from its Dec 31 baseline of Rank #14 — 569K monthly searches now outside the SERP. Rank #1 keywords fell 373 → 318 WoW. Urgent indexation check, content refresh and link authority rebuild required.</div>
                        <div style={{fontSize:10,fontWeight:700,color:'#DC2626',fontFamily:"'DM Mono',monospace",background:'rgba(220,38,38,.06)',padding:'4px 8px',borderRadius:5,display:'inline-block'}}>Top Risk tab · 201K SV · Rank #1 → NR · 569K SV NR combined</div>
                      </div>
                    </div>

                    {/* Priority 2 */}
                    <div style={{background:'linear-gradient(135deg,rgba(180,83,9,.04) 0%,rgba(180,83,9,.02) 100%)',border:'1.5px solid rgba(180,83,9,.2)',borderRadius:14,padding:'18px 18px 16px',display:'flex',gap:14,alignItems:'flex-start'}}>
                      <div style={{width:40,height:40,borderRadius:12,background:'#B45309',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>📉</div>
                      <div>
                        <span style={{fontSize:9,fontWeight:800,color:'#B45309',letterSpacing:'.1em',textTransform:'uppercase',display:'block',marginBottom:4}}>Priority 2</span>
                        <div style={{fontSize:14,fontWeight:800,color:'#0F172A',marginBottom:6,lineHeight:1.3}}>Capture "vpn" — Highest-Volume At-Risk Keyword</div>
                        <div style={{fontSize:11,color:'#475569',lineHeight:1.6,marginBottom:8}}>Position Overview shows "vpn" (673K SV) at Rank #12 on Sep 30 — highest-volume keyword still outside Page 1. Improved from #13 last week and from Dec 31 baseline of Rank #41, now 2 positions from Page 1. A full Page 1 push for this single keyword represents the largest untapped organic session opportunity in the portfolio.</div>
                        <div style={{fontSize:10,fontWeight:700,color:'#B45309',fontFamily:"'DM Mono',monospace",background:'rgba(180,83,9,.06)',padding:'4px 8px',borderRadius:5,display:'inline-block'}}>Top Risk tab · 673K SV · Dec31 Rank #41 → Sep30 Rank #12</div>
                      </div>
                    </div>

                    {/* Priority 3 */}
                    <div style={{background:'linear-gradient(135deg,rgba(26,86,219,.04) 0%,rgba(26,86,219,.02) 100%)',border:'1.5px solid rgba(26,86,219,.2)',borderRadius:14,padding:'18px 18px 16px',display:'flex',gap:14,alignItems:'flex-start'}}>
                      <div style={{width:40,height:40,borderRadius:12,background:'#1A56DB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🔍</div>
                      <div>
                        <span style={{fontSize:9,fontWeight:800,color:'#1A56DB',letterSpacing:'.1em',textTransform:'uppercase',display:'block',marginBottom:4}}>Priority 3</span>
                        <div style={{fontSize:14,fontWeight:800,color:'#0F172A',marginBottom:6,lineHeight:1.3}}>Stabilize SD-WAN Momentum Loss</div>
                        <div style={{fontSize:11,color:'#475569',lineHeight:1.6,marginBottom:8}}>By Category tab shows SD-WAN with the weakest WoW momentum: 22 gaining vs 45 declining (net −23), 54/130 at Rank #1 (42%), avg rank 5.5 and 17 NR. "wan" (33.1K SV) fell #1 → #21 and "fully managed sd wan" dropped to NR. Full topical coverage and content authority audit required.</div>
                        <div style={{fontSize:10,fontWeight:700,color:'#1A56DB',fontFamily:"'DM Mono',monospace",background:'rgba(26,86,219,.06)',padding:'4px 8px',borderRadius:5,display:'inline-block'}}>By Category · 45 declining · 17 NR · net −23 WoW</div>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            );
          })()}

        </div>

        {/* ═══ TRAFFIC OVERVIEW ═══ */}
        <div className={`fn-tab-panel${activeTab==='traffic'?' active':''}`}>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611

          {/* ── Executive Summary Banner ── */}
          <div style={{background:'linear-gradient(135deg,#0F172A 0%,#1E293B 100%)',borderRadius:12,padding:'20px 24px',marginBottom:20,display:'flex',alignItems:'flex-start',gap:24,flexWrap:'wrap'}}>
            <div style={{flex:'1 1 300px'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontSize:11,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'#94A3B8'}}>Traffic Performance Report</span>
<<<<<<< HEAD
                <span style={{background:'rgba(26,86,219,.35)',color:'#93C5FD',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,border:'1px solid rgba(147,197,253,.3)'}}>Week of Oct 07, 2026</span>
=======
                <span style={{background:'rgba(26,86,219,.35)',color:'#93C5FD',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,border:'1px solid rgba(147,197,253,.3)'}}>Week of Sep 30, 2026</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              <div style={{fontSize:22,fontWeight:800,color:'#F8FAFC',lineHeight:1.2,marginBottom:6}}>Organic Traffic</div>
            </div>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
              {[
                {src:'GSC',label:'Google Search Console',color:'#10B981',bg:'rgba(16,185,129,.15)',border:'rgba(16,185,129,.3)',desc:'Search impressions & clicks'},
                {src:'GA',label:'Google Analytics',color:'#60A5FA',bg:'rgba(96,165,250,.15)',border:'rgba(96,165,250,.3)',desc:'Sessions, channels & pages'},
              ].map(s=>(
                <div key={s.src} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:10,padding:'10px 16px',minWidth:170}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <span style={{background:s.color,color:'#fff',fontSize:9,fontWeight:800,padding:'2px 6px',borderRadius:4,letterSpacing:'.06em'}}>{s.src}</span>
                    <span style={{fontSize:11,fontWeight:700,color:s.color}}>{s.label}</span>
                  </div>
                  <div style={{fontSize:10,color:'#94A3B8'}}>{s.desc}</div>
                  <div style={{fontSize:9,color:'#64748B',marginTop:2}}>Scope: WW · Sun–Sat</div>
                </div>
              ))}
            </div>
          </div>

<<<<<<< HEAD
          {/* ══ Traffic Metrics — separate GSC and GA blocks ══ */}
          {([
            {src:'GSC',color:'#047857',title:'Complete Traffic Metrics — GSC (Google Search Console)',sub:'All Organic · Branded · Non-Branded · Worldwide · Dec 31, 2025 → Oct 07, 2026',badge:'GSC · Search Console'},
            {src:'GA',color:'#1D4ED8',title:'Complete Traffic Metrics — GA (Google Analytics)',sub:'Pages and Channels · Worldwide · Dec 31, 2025 → Oct 07, 2026',badge:'GA · Analytics'},
          ] as const).map(blk=>(
          <div key={blk.src} style={{background:'#fff',border:`2px solid ${blk.color}`,borderRadius:14,overflow:'hidden',boxShadow:'0 4px 16px rgba(15,23,42,.08)',marginBottom:20}}>
            <div style={{padding:'16px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',background:blk.color}}>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:'#fff',letterSpacing:'-.01em'}}>{blk.title}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.85)',marginTop:2,fontWeight:600}}>{blk.sub}</div>
              </div>
              <span style={{background:'#fff',color:blk.color,fontSize:11,fontWeight:800,padding:'5px 12px',borderRadius:6,letterSpacing:'.04em'}}>{blk.badge}</span>
=======
          {/* ══ Full Data Table ══ */}
          <div style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:12,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
            <div style={{padding:'14px 20px',borderBottom:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#FAFBFC'}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:'#0F172A'}}>Complete Traffic Metrics — All Sources</div>
                <div style={{fontSize:10,color:'#94A3B8',marginTop:2}}>GSC + GA · Worldwide · Baseline Dec 31, 2025 → Latest Sep 30, 2026</div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <span style={{background:'rgba(16,185,129,.12)',color:'#065F46',fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:5,border:'1px solid rgba(16,185,129,.2)'}}>GSC · Search Console</span>
                <span style={{background:'rgba(59,130,246,.12)',color:'#1D4ED8',fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:5,border:'1px solid rgba(59,130,246,.2)'}}>GA · Analytics</span>
              </div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead>
                  <tr style={{background:'#F8FAFC',borderBottom:'2px solid #E2E8F0'}}>
                    <th style={{textAlign:'center',padding:'9px 10px',fontSize:9,fontWeight:700,color:'#64748B',letterSpacing:'.06em',textTransform:'uppercase',width:46}}>Source</th>
                    <th style={{textAlign:'left',padding:'9px 14px',fontSize:9,fontWeight:700,color:'#64748B',letterSpacing:'.06em',textTransform:'uppercase',minWidth:180}}>Category</th>
                    <th style={{textAlign:'right',padding:'9px 12px',fontSize:9,fontWeight:700,color:'#64748B',letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Baseline<br/><span style={{fontWeight:500,fontSize:8}}>Dec 31</span></th>
<<<<<<< HEAD
                    <th style={{textAlign:'right',padding:'9px 12px',fontSize:9,fontWeight:700,color:'#64748B',letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Sep 30<br/><span style={{fontWeight:500,fontSize:8}}>Prev Week</span></th>
                    <th style={{textAlign:'right',padding:'9px 12px',fontSize:9,fontWeight:700,color:'#1A56DB',letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Oct 07<br/><span style={{fontWeight:500,fontSize:8}}>Latest</span></th>
                    <th style={{textAlign:'center',padding:'9px 12px',fontSize:9,fontWeight:700,color:'#64748B',letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>WoW Δ<br/><span style={{fontWeight:500,fontSize:8}}>Sep 30 → Oct 07</span></th>
                    <th style={{textAlign:'center',padding:'9px 14px',fontSize:9,fontWeight:700,color:'#64748B',letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>41-Wk Trend</th>
=======
                    <th style={{textAlign:'right',padding:'9px 12px',fontSize:9,fontWeight:700,color:'#64748B',letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Sep 23<br/><span style={{fontWeight:500,fontSize:8}}>Prev Week</span></th>
                    <th style={{textAlign:'right',padding:'9px 12px',fontSize:9,fontWeight:700,color:'#1A56DB',letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Sep 30<br/><span style={{fontWeight:500,fontSize:8}}>Latest</span></th>
                    <th style={{textAlign:'center',padding:'9px 12px',fontSize:9,fontWeight:700,color:'#64748B',letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>WoW Δ<br/><span style={{fontWeight:500,fontSize:8}}>Sep 23 → Sep 30</span></th>
                    <th style={{textAlign:'center',padding:'9px 14px',fontSize:9,fontWeight:700,color:'#64748B',letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>40-Wk Trend</th>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                  </tr>
                </thead>
                <tbody>
                  {([
                    {src:'GSC',srcColor:'#10B981',srcBg:'rgba(16,185,129,.1)',label:'All Organic Traffic',key:'allOrganic',group:'Search'},
                    {src:'GSC',srcColor:'#10B981',srcBg:'rgba(16,185,129,.1)',label:'Branded Traffic',key:'branded',group:''},
                    {src:'GSC',srcColor:'#10B981',srcBg:'rgba(16,185,129,.1)',label:'Non-Branded Traffic',key:'nonBranded',group:''},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'/cyberglossary',key:'cyberglossary',group:'Pages'},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'/products',key:'products',group:''},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'/home page',key:'homePage',group:''},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'/blog',key:'blog',group:''},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'/solutions',key:'solutions',group:''},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'/about-us',key:'aboutUs',group:''},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'/articles',key:'articles',group:''},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'Direct (All)',key:'directGA',group:'Channels'},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'Direct (Valid — excl. email/live-chat/Nexus)',key:'directValid',group:'Channels'},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'Direct (Valid — excl. Downloads)',key:'directDownloads',group:'Channels'},
                    {src:'GA',srcColor:'#3B82F6',srcBg:'rgba(59,130,246,.1)',label:'Referrals',key:'referrals',group:''},
<<<<<<< HEAD
                  ] as const).filter(r=>r.src===blk.src).map((row,i)=>{
                    const data = TRAFFIC_DATA[row.key];
                    const base = data[0], prev = data[39], cur = data[40];
=======
                  ] as const).map((row,i)=>{
                    const data = TRAFFIC_DATA[row.key];
                    const base = data[0], prev = data[38], cur = data[39];
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    const wow = TRAFFIC_WOW[row.key];
                    const pos = wow.pct >= 0;
                    const fmt = (v:number)=>v>=1000?(v>=100000?(v/1000).toFixed(0)+'K':(v/1000).toFixed(1)+'K'):v.toString();
                    const W=110,H=22;
                    const mn=Math.min(...data),mx=Math.max(...data);
                    const pts=data.map((v,idx)=>{const x=(idx/(data.length-1))*(W-2)+1;const y=mx===mn?H/2:((1-(v-mn)/(mx-mn))*(H-4))+2;return `${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ');
                    const sparkCol = '#1E293B';
                    const endX = ((data.length-1)/(data.length-1))*(W-2)+1;
                    const endY = mx===mn?H/2:((1-(cur-mn)/(mx-mn))*(H-4))+2;
                    const isGroupStart = row.group !== '';
                    return (
                      <tr key={row.key} style={{borderBottom:'1px solid #F1F5F9',background:isGroupStart?'#F8FAFC':i%2===0?'#fff':'#FAFBFC'}}>
                        <td style={{padding:'8px 10px',textAlign:'center'}}>
                          <span style={{background:row.srcBg,color:row.srcColor,fontSize:8,fontWeight:800,padding:'2px 6px',borderRadius:4,letterSpacing:'.05em',display:'inline-block'}}>{row.src}</span>
                        </td>
                        <td style={{padding:'8px 14px',fontWeight:700,color:'#0F172A',fontSize:12}}>
                          {row.group && <span style={{display:'inline-block',fontSize:8,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.06em',marginRight:7,background:'#F1F5F9',padding:'1px 5px',borderRadius:3}}>{row.group}</span>}
                          {row.label}
                        </td>
                        <td style={{padding:'8px 12px',textAlign:'right',fontFamily:"'DM Mono',monospace",fontSize:11,color:'#94A3B8',fontWeight:600}}>{fmt(base)}</td>
                        <td style={{padding:'8px 12px',textAlign:'right',fontFamily:"'DM Mono',monospace",fontSize:11,color:'#64748B',fontWeight:600}}>{fmt(prev)}</td>
                        <td style={{padding:'8px 12px',textAlign:'right',fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:800,color:'#0F172A',borderLeft:'2px solid rgba(26,86,219,.15)',borderRight:'2px solid rgba(26,86,219,.15)'}}>{fmt(cur)}</td>
                        <td style={{padding:'8px 12px',textAlign:'center'}}>
                          <div style={{display:'inline-flex',flexDirection:'column',alignItems:'center',gap:1,background:pos?'rgba(5,150,105,.06)':'rgba(220,38,38,.06)',padding:'3px 8px',borderRadius:6}}>
                            <span style={{fontSize:11,fontWeight:800,fontFamily:"'DM Mono',monospace",color:pos?'#059669':'#DC2626'}}>{pos?'▲':'▼'} {Math.abs(wow.pct).toFixed(2)}%</span>
                            <span style={{fontSize:8,color:'#94A3B8',fontFamily:"'DM Mono',monospace"}}>{pos?'+':''}{wow.abs.toLocaleString()}</span>
                          </div>
                        </td>
                        <td style={{padding:'6px 14px',textAlign:'center'}}>
                          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                            <polyline points={pts} fill="none" stroke={sparkCol} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx={endX} cy={endY} r="2.5" fill={sparkCol}/>
                          </svg>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
<<<<<<< HEAD
          ))}
=======
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611

          {/* ══ SECTION 1: GSC — Search Performance ══ */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <span style={{background:'#10B981',color:'#fff',fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:5,letterSpacing:'.08em',flexShrink:0}}>GSC</span>
            <span style={{fontSize:13,fontWeight:800,color:'#0F172A',letterSpacing:'-.01em'}}>Google Search Console — Organic Search Traffic</span>
            <div style={{flex:1,height:1,background:'#E2E8F0'}}></div>
<<<<<<< HEAD
            <span style={{fontSize:10,color:'#94A3B8',fontWeight:500}}>Worldwide · Sep 30 → Oct 07, 2026</span>
=======
            <span style={{fontSize:10,color:'#94A3B8',fontWeight:500}}>Worldwide · Sep 23 → Sep 30, 2026</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
          </div>

          {/* GSC KPI Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:16}}>
            {([
              {label:'All Organic Traffic',key:'allOrganic',desc:'Total organic search sessions',icon:'🔍'},
              {label:'Branded Traffic',key:'branded',desc:'Sessions from brand-name queries',icon:'🏷'},
              {label:'Non-Branded Traffic',key:'nonBranded',desc:'Sessions from generic keywords',icon:'🌐'},
            ] as const).map(item=>{
              const data = TRAFFIC_DATA[item.key];
<<<<<<< HEAD
              const cur = data[40], prev = data[39], base = data[0];
=======
              const cur = data[39], prev = data[38], base = data[0];
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              const wow = TRAFFIC_WOW[item.key];
              const pos = wow.pct >= 0;
              const vsBase = cur - base;
              const vsBasePct = ((vsBase / base) * 100).toFixed(1);
              const fmt = (v:number)=>v>=1000?(v>=100000?(v/1000).toFixed(0)+'K':(v/1000).toFixed(1)+'K'):v.toLocaleString();
              const W=80,H=20;
              const mn=Math.min(...data),mx=Math.max(...data);
              const pts=data.map((v,i)=>{const x=(i/(data.length-1))*(W-2)+1;const y=mx===mn?H/2:((1-(v-mn)/(mx-mn))*(H-4))+2;return `${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ');
              return (
                <div key={item.key} style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:12,padding:'16px 20px',boxShadow:'0 1px 4px rgba(0,0,0,.04)',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#10B981,#059669)'}}></div>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6}}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                        <span style={{background:'rgba(16,185,129,.12)',color:'#065F46',fontSize:8,fontWeight:800,padding:'1px 5px',borderRadius:3,letterSpacing:'.06em'}}>GSC</span>
                        <span style={{fontSize:10,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'.05em'}}>{item.icon} {item.label}</span>
                      </div>
                      <div style={{fontSize:28,fontWeight:900,color:'#0F172A',fontFamily:"'DM Mono',monospace",lineHeight:1}}>{fmt(cur)}</div>
                    </div>
                    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{marginTop:4,opacity:.8}}>
                      <polyline points={pts} fill="none" stroke={pos?'#10B981':'#D93025'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{fontSize:10,color:'#64748B',marginBottom:8}}>{item.desc}</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid #F1F5F9',paddingTop:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      <span style={{fontSize:12,fontWeight:800,fontFamily:"'DM Mono',monospace",color:pos?'#059669':'#DC2626',background:pos?'rgba(5,150,105,.08)':'rgba(220,38,38,.08)',padding:'2px 7px',borderRadius:5}}>
                        {pos?'▲':'▼'} {Math.abs(wow.pct).toFixed(2)}%
                      </span>
<<<<<<< HEAD
                      <span style={{fontSize:9,color:'#94A3B8',fontFamily:"'DM Mono',monospace"}}>{pos?'+':''}{wow.abs.toLocaleString()} vs Sep 30</span>
=======
                      <span style={{fontSize:9,color:'#94A3B8',fontFamily:"'DM Mono',monospace"}}>{pos?'+':''}{wow.abs.toLocaleString()} vs Sep 23</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:9,color:'#94A3B8'}}>vs Dec 31 baseline</div>
                      <div style={{fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace",color:vsBase>=0?'#059669':'#DC2626'}}>{vsBase>=0?'+':''}{vsBasePct}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GSC Trend Chart */}
          <div style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:12,padding:'16px 20px',marginBottom:20,boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                  <span style={{background:'rgba(16,185,129,.12)',color:'#065F46',fontSize:8,fontWeight:800,padding:'1px 5px',borderRadius:3,letterSpacing:'.06em'}}>GSC</span>
<<<<<<< HEAD
                  <span style={{fontSize:12,fontWeight:700,color:'#0F172A'}}>Search Traffic — 41-Week Trend</span>
                </div>
                <div style={{fontSize:10,color:'#94A3B8'}}>All Organic · Branded · Non-Branded · Dec 31, 2025 → Oct 07, 2026</div>
=======
                  <span style={{fontSize:12,fontWeight:700,color:'#0F172A'}}>Search Traffic — 40-Week Trend</span>
                </div>
                <div style={{fontSize:10,color:'#94A3B8'}}>All Organic · Branded · Non-Branded · Dec 31, 2025 → Sep 30, 2026</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              <div style={{display:'flex',gap:6}}>
                {[{c:'#1A56DB',l:'All Organic'},{c:'#7C3AED',l:'Branded',d:true},{c:'#0A7A55',l:'Non-Branded'}].map(s=>(
                  <div key={s.l} style={{display:'flex',alignItems:'center',gap:4}}>
                    <svg width={16} height={8}><line x1="0" y1="4" x2="16" y2="4" stroke={s.c} strokeWidth={s.d?0:2} strokeDasharray={s.d?'3,2':undefined}/>{s.d&&<><line x1="0" y1="4" x2="5" y2="4" stroke={s.c} strokeWidth={2}/><line x1="9" y1="4" x2="16" y2="4" stroke={s.c} strokeWidth={2}/></>}</svg>
                    <span style={{fontSize:9,color:'#64748B',fontWeight:600}}>{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{height:230}}>
              <canvas id="trafficOrgChart"></canvas>
            </div>
          </div>

          {/* ══ SECTION 2: GA — Page Performance ══ */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <span style={{background:'#3B82F6',color:'#fff',fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:5,letterSpacing:'.08em',flexShrink:0}}>GA</span>
            <span style={{fontSize:13,fontWeight:800,color:'#0F172A',letterSpacing:'-.01em'}}>Google Analytics — Page-Level Traffic</span>
            <div style={{flex:1,height:1,background:'#E2E8F0'}}></div>
<<<<<<< HEAD
            <span style={{fontSize:10,color:'#94A3B8',fontWeight:500}}>Worldwide · Sep 30 → Oct 07, 2026</span>
          </div>

          {/* GA Page KPI grid — cur=data[40]=Oct07, prev=data[39]=Sep30 */}
=======
            <span style={{fontSize:10,color:'#94A3B8',fontWeight:500}}>Worldwide · Sep 23 → Sep 30, 2026</span>
          </div>

          {/* GA Page KPI grid — cur=data[39]=Sep30, prev=data[38]=Sep23 */}
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
            {([
              {label:'/cyberglossary',key:'cyberglossary',color:'#D93025',bg:'rgba(217,48,37,.08)',icon:'📚'},
              {label:'/products',key:'products',color:'#B45309',bg:'rgba(180,83,9,.08)',icon:'📦'},
              {label:'/home page',key:'homePage',color:'#0E7490',bg:'rgba(14,116,144,.08)',icon:'🏠'},
              {label:'/blog',key:'blog',color:'#059669',bg:'rgba(5,150,105,.08)',icon:'✍'},
              {label:'/solutions',key:'solutions',color:'#7C3AED',bg:'rgba(124,58,237,.08)',icon:'💡'},
              {label:'/about-us',key:'aboutUs',color:'#EC4899',bg:'rgba(236,72,153,.08)',icon:'🏢'},
              {label:'/articles',key:'articles',color:'#64748B',bg:'rgba(100,116,139,.08)',icon:'📄'},
            ] as const).map(item=>{
              const data = TRAFFIC_DATA[item.key];
<<<<<<< HEAD
              const cur = data[40], prev = data[39];
=======
              const cur = data[39], prev = data[38];
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              const wow = TRAFFIC_WOW[item.key];
              const pos = wow.pct >= 0;
              const fmt = (v:number)=>v>=1000?(v>=10000?(v/1000).toFixed(0)+'K':(v/1000).toFixed(1)+'K'):v.toLocaleString();
              return (
                <div key={item.key} style={{background:'#fff',border:`1px solid ${item.color}33`,borderRadius:10,padding:'12px 14px',boxShadow:'0 1px 3px rgba(0,0,0,.03)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:5}}>
                    <span style={{background:'rgba(59,130,246,.1)',color:'#1D4ED8',fontSize:8,fontWeight:800,padding:'1px 5px',borderRadius:3,letterSpacing:'.06em'}}>GA</span>
                    <span style={{fontSize:9,fontWeight:700,color:'#64748B'}}>{item.icon} {item.label}</span>
                  </div>
                  <div style={{fontSize:22,fontWeight:900,fontFamily:"'DM Mono',monospace",color:'#0F172A',lineHeight:1,marginBottom:4}}>{fmt(cur)}</div>
                  <div style={{fontSize:9,color:'#94A3B8',marginBottom:5}}>prev: {fmt(prev)}</div>
                  <div style={{display:'flex',alignItems:'center',gap:4}}>
                    <span style={{fontSize:11,fontWeight:800,fontFamily:"'DM Mono',monospace",color:pos?'#059669':'#DC2626'}}>{pos?'▲':'▼'}{Math.abs(wow.pct).toFixed(2)}%</span>
                    <span style={{fontSize:9,color:'#94A3B8'}}>{pos?'+':''}{wow.abs.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GA Charts Row — Page trend + Page bar */}
          <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:14,marginBottom:20}}>
            <div style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:12,padding:'16px 20px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                <span style={{background:'rgba(59,130,246,.1)',color:'#1D4ED8',fontSize:8,fontWeight:800,padding:'1px 5px',borderRadius:3,letterSpacing:'.06em'}}>GA</span>
<<<<<<< HEAD
                <span style={{fontSize:12,fontWeight:700,color:'#0F172A'}}>41-Week Page Traffic Trend</span>
              </div>
              <div style={{fontSize:10,color:'#94A3B8',marginBottom:10}}>Key URL traffic by week · Dec 31 → Oct 07</div>
=======
                <span style={{fontSize:12,fontWeight:700,color:'#0F172A'}}>40-Week Page Traffic Trend</span>
              </div>
              <div style={{fontSize:10,color:'#94A3B8',marginBottom:10}}>Key URL traffic by week · Dec 31 → Sep 30</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              <div style={{height:210}}>
                <canvas id="trafficPageChart"></canvas>
              </div>
            </div>
            <div style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:12,padding:'16px 20px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                <span style={{background:'rgba(59,130,246,.1)',color:'#1D4ED8',fontSize:8,fontWeight:800,padding:'1px 5px',borderRadius:3,letterSpacing:'.06em'}}>GA</span>
<<<<<<< HEAD
                <span style={{fontSize:12,fontWeight:700,color:'#0F172A'}}>Page Sessions — Sep 30 vs Oct 07</span>
=======
                <span style={{fontSize:12,fontWeight:700,color:'#0F172A'}}>Page Sessions — Sep 23 vs Sep 30</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              <div style={{fontSize:10,color:'#94A3B8',marginBottom:10}}>WoW comparison by page</div>
              <div style={{height:210}}>
                <canvas id="trafficPageBarChart"></canvas>
              </div>
            </div>
          </div>

          {/* ══ SECTION 3: GA — Direct Traffic ══ */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <span style={{background:'#3B82F6',color:'#fff',fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:5,letterSpacing:'.08em',flexShrink:0}}>GA</span>
            <span style={{fontSize:13,fontWeight:800,color:'#0F172A',letterSpacing:'-.01em'}}>Google Analytics — Direct Traffic</span>
            <div style={{flex:1,height:1,background:'#E2E8F0'}}></div>
            <span style={{fontSize:10,color:'#94A3B8',fontWeight:500}}>All Direct · Validated (excl. email / live-chat / Nexus) · excl. Downloads</span>
          </div>

          {/* Direct KPI Cards */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:14}}>
            {([
              {
                key:'directGA',
                label:'Direct (All)',
                note:'All direct sessions incl. email, live chat & Nexus device',
                icon:'⚡',
                color:'#7C3AED',
                accentBg:'linear-gradient(90deg,#7C3AED,#6D28D9)',
              },
              {
                key:'directValid',
                label:'Direct (Valid)',
                note:'Excl. email, live-chat page & Device — Nexus',
                icon:'✅',
                color:'#F59E0B',
                accentBg:'linear-gradient(90deg,#F59E0B,#D97706)',
              },
              {
                key:'directDownloads',
                label:'Direct (Valid — excl. Downloads)',
                note:'Further excl. /downloads traffic for cleanest direct intent signal',
                icon:'📥',
                color:'#0E7490',
                accentBg:'linear-gradient(90deg,#0E7490,#0891B2)',
              },
            ] as const).map(item=>{
              const data = TRAFFIC_DATA[item.key];
<<<<<<< HEAD
              const cur = data[40], prev = data[39], base = data[0];
=======
              const cur = data[39], prev = data[38], base = data[0];
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              const wow = TRAFFIC_WOW[item.key];
              const pos = wow.pct >= 0;
              const fmt = (v:number)=>v>=1000?(v>=100000?(v/1000).toFixed(0)+'K':(v/1000).toFixed(1)+'K'):v.toLocaleString();
              const vsBase = ((cur-base)/base*100);
              // sparkline
              const W=88,H=22;
              const mn=Math.min(...data),mx=Math.max(...data);
              const pts=data.map((v,i)=>{const x=(i/(data.length-1))*(W-2)+1;const y=mx===mn?H/2:((1-(v-mn)/(mx-mn))*(H-4))+2;return `${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ');
              return (
                <div key={item.key} style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:12,padding:'18px 22px',boxShadow:'0 1px 4px rgba(0,0,0,.04)',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:item.accentBg}}></div>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:8}}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                        <span style={{background:'rgba(59,130,246,.1)',color:'#1D4ED8',fontSize:8,fontWeight:800,padding:'1px 5px',borderRadius:3,letterSpacing:'.06em'}}>GA</span>
                        <span style={{fontSize:10,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'.05em'}}>{item.icon} {item.label}</span>
                      </div>
                      <div style={{fontSize:32,fontWeight:900,fontFamily:"'DM Mono',monospace",color:'#0F172A',lineHeight:1}}>{fmt(cur)}</div>
                      <div style={{fontSize:10,color:'#94A3B8',marginTop:4,maxWidth:260}}>{item.note}</div>
                    </div>
                    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{marginTop:6,opacity:.85}}>
                      <polyline points={pts} fill="none" stroke={pos?item.color:'#DC2626'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,borderTop:'1px solid #F1F5F9',paddingTop:12}}>
                    <div>
<<<<<<< HEAD
                      <div style={{fontSize:9,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:2}}>Prev Week (Sep 30)</div>
=======
                      <div style={{fontSize:9,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:2}}>Prev Week (Sep 23)</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                      <div style={{fontSize:14,fontWeight:800,fontFamily:"'DM Mono',monospace",color:'#64748B'}}>{fmt(prev)}</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:2}}>WoW Change</div>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <span style={{fontSize:14,fontWeight:800,fontFamily:"'DM Mono',monospace",color:pos?'#059669':'#DC2626'}}>{pos?'▲':'▼'}{Math.abs(wow.pct).toFixed(2)}%</span>
                      </div>
                      <div style={{fontSize:9,color:'#94A3B8',fontFamily:"'DM Mono',monospace"}}>{pos?'+':''}{wow.abs.toLocaleString()} sessions</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:2}}>vs Dec 31 Baseline</div>
                      <div style={{fontSize:14,fontWeight:800,fontFamily:"'DM Mono',monospace",color:vsBase>=0?'#059669':'#DC2626'}}>{vsBase>=0?'+':''}{vsBase.toFixed(1)}%</div>
                      <div style={{fontSize:9,color:'#94A3B8',fontFamily:"'DM Mono',monospace"}}>baseline: {fmt(base)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Delta Insight */}
          {(()=>{
<<<<<<< HEAD
            const allCur   = TRAFFIC_DATA.directGA[40];
            const validCur = TRAFFIC_DATA.directValid[40];
            const dlCur    = TRAFFIC_DATA.directDownloads[40];
=======
            const allCur   = TRAFFIC_DATA.directGA[39];
            const validCur = TRAFFIC_DATA.directValid[39];
            const dlCur    = TRAFFIC_DATA.directDownloads[39];
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
            const noiseL1  = allCur - validCur;
            const noiseL1Pct = ((noiseL1/allCur)*100).toFixed(1);
            const noiseL2  = validCur - dlCur;
            const noiseL2Pct = ((noiseL2/allCur)*100).toFixed(1);
            const totalNoisePct = (((allCur-dlCur)/allCur)*100).toFixed(1);
            return (
              <div style={{background:'linear-gradient(135deg,#FEF3C7,#FDE68A)',border:'1px solid #FCD34D',borderRadius:10,padding:'12px 18px',marginBottom:14,display:'flex',alignItems:'center',gap:14}}>
                <span style={{fontSize:22,flexShrink:0}}>📊</span>
                <div style={{flex:1}}>
<<<<<<< HEAD
                  <div style={{fontSize:11,fontWeight:800,color:'#92400E',marginBottom:4}}>Direct Traffic Noise Filter — Oct 07, 2026</div>
=======
                  <div style={{fontSize:11,fontWeight:800,color:'#92400E',marginBottom:4}}>Direct Traffic Noise Filter — Sep 30, 2026</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                    <div style={{fontSize:10,color:'#78350F',lineHeight:1.5}}>
                      <div style={{fontWeight:800,marginBottom:1}}>Layer 1 — Email / Live-Chat / Nexus</div>
                      <strong>{noiseL1.toLocaleString()} sessions ({noiseL1Pct}%)</strong> filtered → Valid: <strong>{validCur.toLocaleString()}</strong>
                    </div>
                    <div style={{fontSize:10,color:'#78350F',lineHeight:1.5}}>
                      <div style={{fontWeight:800,marginBottom:1}}>Layer 2 — /downloads traffic</div>
                      <strong>{noiseL2.toLocaleString()} additional sessions ({noiseL2Pct}%)</strong> filtered → Clean: <strong>{dlCur.toLocaleString()}</strong>
                    </div>
                    <div style={{fontSize:10,color:'#78350F',lineHeight:1.5,background:'rgba(146,64,14,.08)',borderRadius:6,padding:'6px 10px'}}>
                      <div style={{fontWeight:800,marginBottom:1}}>Total Noise Removed</div>
                      <strong>{(allCur-dlCur).toLocaleString()} sessions ({totalNoisePct}%)</strong> of raw Direct are noise. Cleanest signal: <strong>{dlCur.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Direct Trendline Chart */}
          <div style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:12,padding:'16px 20px',marginBottom:20,boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                  <span style={{background:'rgba(59,130,246,.1)',color:'#1D4ED8',fontSize:8,fontWeight:800,padding:'1px 5px',borderRadius:3,letterSpacing:'.06em'}}>GA</span>
<<<<<<< HEAD
                  <span style={{fontSize:12,fontWeight:700,color:'#0F172A'}}>Direct Traffic — 41-Week Trendline</span>
                </div>
                <div style={{fontSize:10,color:'#94A3B8'}}>All Direct vs Validated Direct · Dec 31, 2025 → Oct 07, 2026</div>
=======
                  <span style={{fontSize:12,fontWeight:700,color:'#0F172A'}}>Direct Traffic — 40-Week Trendline</span>
                </div>
                <div style={{fontSize:10,color:'#94A3B8'}}>All Direct vs Validated Direct · Dec 31, 2025 → Sep 30, 2026</div>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <div style={{width:20,height:3,background:'#7C3AED',borderRadius:2}}></div>
                  <span style={{fontSize:9,fontWeight:600,color:'#64748B'}}>Direct (All)</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <svg width={20} height={6}><line x1="0" y1="3" x2="5" y2="3" stroke="#F59E0B" strokeWidth={2}/><line x1="8" y1="3" x2="13" y2="3" stroke="#F59E0B" strokeWidth={2}/><line x1="16" y1="3" x2="20" y2="3" stroke="#F59E0B" strokeWidth={2}/></svg>
                  <span style={{fontSize:9,fontWeight:600,color:'#64748B'}}>Direct (Valid — excl. Nexus/email)</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <svg width={20} height={6}><line x1="0" y1="3" x2="3" y2="3" stroke="#0E7490" strokeWidth={2}/><line x1="6" y1="3" x2="9" y2="3" stroke="#0E7490" strokeWidth={2}/><line x1="12" y1="3" x2="15" y2="3" stroke="#0E7490" strokeWidth={2}/><line x1="18" y1="3" x2="20" y2="3" stroke="#0E7490" strokeWidth={2}/></svg>
                  <span style={{fontSize:9,fontWeight:600,color:'#64748B'}}>Direct (Valid — excl. Downloads)</span>
                </div>
              </div>
            </div>
            <div style={{height:240}}>
              <canvas id="trafficDirectChart"></canvas>
            </div>
          </div>



        </div>


      </div>

      {/* ── Rank 11–100 Modal ── */}
      {modal1100 && (
        <div onClick={()=>setModal1100(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface)',borderRadius:12,width:'100%',maxWidth:780,maxHeight:'82vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,0.35)',border:'1px solid var(--border)'}}>
            {/* header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:15,fontWeight:700,color:'var(--text1)',fontFamily:"'Inter',sans-serif"}}>Rank 11–100 Keywords</span>
<<<<<<< HEAD
                <span style={{background:'#F97316',color:'#fff',fontSize:11,fontWeight:700,borderRadius:20,padding:'2px 10px',fontFamily:"'DM Mono',monospace"}}>{RANK_11_100.length} Keywords</span>
=======
                <span style={{background:'#F97316',color:'#fff',fontSize:11,fontWeight:700,borderRadius:20,padding:'2px 10px',fontFamily:"'DM Mono',monospace"}}>88 Keywords</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Source: Semrush</span>
                <button onClick={()=>setModal1100(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text2)',fontSize:18,lineHeight:1,padding:2}}>✕</button>
              </div>
            </div>
            {/* table */}
            <div style={{overflowY:'auto',flex:1}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead style={{position:'sticky',top:0,background:'var(--surface)',zIndex:1}}>
                  <tr style={{borderBottom:'2px solid var(--border)'}}>
                    <th style={{textAlign:'left',padding:'8px 20px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>KEYWORDS</th>
                    <th style={{textAlign:'center',padding:'8px 10px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>FUNNEL</th>
                    <th style={{textAlign:'right',padding:'8px 14px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>SV</th>
                    <th style={{textAlign:'right',padding:'8px 20px 8px 10px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>POS PREV → CURR</th>
                  </tr>
                </thead>
                <tbody>
<<<<<<< HEAD
                  {(()=>{const seen=new Set<string>();return RANK_11_100.filter(r=>{if(seen.has(r.kw))return false;seen.add(r.kw);return true;});})().map((r,i)=>(
=======
                  {RANK_11_100.map((r,i)=>(
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'transparent':'rgba(0,0,0,0.02)'}}>
                      <td style={{padding:'7px 20px',color:'var(--text1)',fontWeight:500,fontFamily:"'Inter',sans-serif",fontSize:12}}>{r.kw}</td>
                      <td style={{padding:'7px 10px',textAlign:'center'}}>
                        <span style={{fontSize:9,fontWeight:700,borderRadius:4,padding:'2px 6px',background:r.funnel==='TOFU'?'rgba(26,86,219,.12)':r.funnel==='MOFU'?'rgba(5,150,105,.12)':'rgba(180,83,9,.12)',color:r.funnel==='TOFU'?'#1A56DB':r.funnel==='MOFU'?'#059669':'#B45309',fontFamily:"'DM Mono',monospace"}}>{r.funnel}</span>
                      </td>
                      <td style={{padding:'7px 14px',textAlign:'right',color:'var(--text2)',fontFamily:"'DM Mono',monospace",fontSize:11}}>{r.sv>0?r.sv.toLocaleString():'-'}</td>
                      <td style={{padding:'7px 20px 7px 10px',textAlign:'right',fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--text2)',whiteSpace:'nowrap'}}>
<<<<<<< HEAD
                        {r.prev==='-'?101:'#'+r.prev} <span style={{color:'var(--text3)'}}>→</span> <span style={{color:'#0891B2',fontWeight:700}}>#{r.cur}</span>
=======
                        {r.prev==='-'?'NR':'#'+r.prev} <span style={{color:'var(--text3)'}}>→</span> <span style={{color:'#0891B2',fontWeight:700}}>#{r.cur}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* footer */}
            <div style={{padding:'10px 20px',borderTop:'1px solid var(--border)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<<<<<<< HEAD
              <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Scroll to view all {RANK_11_100.length} keywords</span>
=======
              <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Scroll to view all 88 keywords</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Click outside to close</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Not Ranking Modal ── */}
      {modalNR && (
        <div onClick={()=>setModalNR(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface)',borderRadius:12,width:'100%',maxWidth:780,maxHeight:'82vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,0.35)',border:'1px solid var(--border)'}}>
            {/* header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:15,fontWeight:700,color:'var(--text1)',fontFamily:"'Inter',sans-serif"}}>Not Ranking Keywords</span>
<<<<<<< HEAD
                <span style={{background:'#F97316',color:'#fff',fontSize:11,fontWeight:700,borderRadius:20,padding:'2px 10px',fontFamily:"'DM Mono',monospace"}}>{NOT_RANKING.length} Keywords</span>
=======
                <span style={{background:'#F97316',color:'#fff',fontSize:11,fontWeight:700,borderRadius:20,padding:'2px 10px',fontFamily:"'DM Mono',monospace"}}>85 Keywords</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Source: Semrush</span>
                <button onClick={()=>setModalNR(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text2)',fontSize:18,lineHeight:1,padding:2}}>✕</button>
              </div>
            </div>
            {/* table */}
            <div style={{overflowY:'auto',flex:1}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead style={{position:'sticky',top:0,background:'var(--surface)',zIndex:1}}>
                  <tr style={{borderBottom:'2px solid var(--border)'}}>
                    <th style={{textAlign:'left',padding:'8px 20px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>KEYWORDS</th>
                    <th style={{textAlign:'center',padding:'8px 10px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>FUNNEL</th>
                    <th style={{textAlign:'right',padding:'8px 14px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>SV</th>
                    <th style={{textAlign:'right',padding:'8px 20px 8px 10px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>POS PREV → CURR</th>
                  </tr>
                </thead>
                <tbody>
                  {NOT_RANKING.map((r,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'transparent':'rgba(0,0,0,0.02)'}}>
                      <td style={{padding:'7px 20px',color:'var(--text1)',fontWeight:500,fontFamily:"'Inter',sans-serif",fontSize:12}}>{r.kw}</td>
                      <td style={{padding:'7px 10px',textAlign:'center'}}>
                        <span style={{fontSize:9,fontWeight:700,borderRadius:4,padding:'2px 6px',background:r.funnel==='TOFU'?'rgba(26,86,219,.12)':r.funnel==='MOFU'?'rgba(5,150,105,.12)':'rgba(180,83,9,.12)',color:r.funnel==='TOFU'?'#1A56DB':r.funnel==='MOFU'?'#059669':'#B45309',fontFamily:"'DM Mono',monospace"}}>{r.funnel}</span>
                      </td>
                      <td style={{padding:'7px 14px',textAlign:'right',color:'var(--text2)',fontFamily:"'DM Mono',monospace",fontSize:11}}>{r.sv>0?r.sv.toLocaleString():'-'}</td>
                      <td style={{padding:'7px 20px 7px 10px',textAlign:'right',fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--text2)',whiteSpace:'nowrap'}}>
<<<<<<< HEAD
                        {r.prev==='-'?101:'#'+r.prev} <span style={{color:'var(--text3)'}}>→</span> <span style={{color:'#DC2626',fontWeight:700}}>101</span>
=======
                        {r.prev==='-'?'NR':'#'+r.prev} <span style={{color:'var(--text3)'}}>→</span> <span style={{color:'#DC2626',fontWeight:700}}>NR</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* footer */}
            <div style={{padding:'10px 20px',borderTop:'1px solid var(--border)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<<<<<<< HEAD
              <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Scroll to view all {NOT_RANKING.length} keywords</span>
=======
              <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Scroll to view all 85 keywords</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Click outside to close</span>
            </div>
          </div>
        </div>
      )}

      {/* ── AIO Keywords Modal ── */}
      {modalAIO && (
        <div onClick={()=>setModalAIO(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface)',borderRadius:16,width:'100%',maxWidth:780,maxHeight:'82vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,.25)',border:'1px solid var(--border)'}}>
            {/* header */}
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
<<<<<<< HEAD
                <span style={{fontSize:15,fontWeight:700,color:'var(--text1)',fontFamily:"'Inter',sans-serif"}}>AIO Keywords — Oct 07, 2026</span>
                <span style={{background:'#4338CA',color:'#fff',fontSize:11,fontWeight:700,borderRadius:20,padding:'2px 10px',fontFamily:"'DM Mono',monospace"}}>{AIO_KEYWORDS.length} Keywords</span>
=======
                <span style={{fontSize:15,fontWeight:700,color:'var(--text1)',fontFamily:"'Inter',sans-serif"}}>AIO Keywords — Sep 30, 2026</span>
                <span style={{background:'#4338CA',color:'#fff',fontSize:11,fontWeight:700,borderRadius:20,padding:'2px 10px',fontFamily:"'DM Mono',monospace"}}>299 Keywords</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              </div>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Source: Semrush</span>
                <button onClick={()=>setModalAIO(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text2)',fontSize:18,lineHeight:1,padding:2}}>✕</button>
              </div>
            </div>
            {/* table */}
            <div style={{overflowY:'auto',flex:1}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead style={{position:'sticky',top:0,background:'var(--surface)',zIndex:1}}>
                  <tr style={{borderBottom:'2px solid var(--border)'}}>
                    <th style={{textAlign:'left',padding:'8px 20px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>KEYWORDS</th>
                    <th style={{textAlign:'center',padding:'8px 10px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>FUNNEL</th>
                    <th style={{textAlign:'right',padding:'8px 14px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>SV</th>
                    <th style={{textAlign:'right',padding:'8px 20px 8px 10px',color:'var(--text3)',fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>POS PREV → CURR</th>
                  </tr>
                </thead>
                <tbody>
<<<<<<< HEAD
                  {(()=>{const seen=new Set<string>();return AIO_KEYWORDS.filter(r=>{const k=r.kw.toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});})().map((r,i)=>(
=======
                  {AIO_KEYWORDS.map((r,i)=>(
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                    <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'transparent':'rgba(0,0,0,0.02)'}}>
                      <td style={{padding:'7px 20px',color:'var(--text1)',fontWeight:500,fontFamily:"'Inter',sans-serif",fontSize:12}}>{r.kw}</td>
                      <td style={{padding:'7px 10px',textAlign:'center'}}>
                        <span style={{fontSize:9,fontWeight:700,borderRadius:4,padding:'2px 6px',background:r.funnel==='TOFU'?'rgba(26,86,219,.12)':r.funnel==='MOFU'?'rgba(5,150,105,.12)':'rgba(180,83,9,.12)',color:r.funnel==='TOFU'?'#1A56DB':r.funnel==='MOFU'?'#059669':'#B45309',fontFamily:"'DM Mono',monospace"}}>{r.funnel}</span>
                      </td>
                      <td style={{padding:'7px 14px',textAlign:'right',color:'var(--text2)',fontFamily:"'DM Mono',monospace",fontSize:11}}>{r.sv>0?r.sv.toLocaleString():'-'}</td>
                      <td style={{padding:'7px 20px 7px 10px',textAlign:'right',fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--text2)',whiteSpace:'nowrap'}}>
<<<<<<< HEAD
                        {r.prev==='NR'||r.prev==='-'?101:'#'+r.prev} <span style={{color:'var(--text3)'}}>→</span> <span style={{color:'#4338CA',fontWeight:700}}>{r.cur==='NR'||r.cur==='-'?101:'#'+r.cur}</span>
=======
                        {r.prev==='NR'||r.prev==='-'?'NR':'#'+r.prev} <span style={{color:'var(--text3)'}}>→</span> <span style={{color:'#4338CA',fontWeight:700}}>{r.cur==='NR'||r.cur==='-'?'NR':'#'+r.cur}</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* footer */}
            <div style={{padding:'10px 20px',borderTop:'1px solid var(--border)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<<<<<<< HEAD
              <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Scroll to view all {AIO_KEYWORDS.length} AIO keywords · Sep 30 → Oct 07</span>
=======
              <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Scroll to view all 299 AIO keywords · Sep 23 → Sep 30</span>
>>>>>>> 3a4d74ef3abc53fc2e78c2f62336a5b1847e4611
              <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'DM Mono',monospace"}}>Click outside to close</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
