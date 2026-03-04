# Sorting Algorithm Comparison - Graph Generator
# Reads CSV from stdin or file, generates chart images as base64 JSON output
# Called by the Java backend automatically

import sys
import json
import base64
import io
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend (no GUI needed)
import matplotlib.pyplot as plt
import numpy as np


def parse_runtime_to_ms(runtime_str):
    # Converts runtime strings like '12.34 ms' or '850.00 µs' into milliseconds
    runtime_str = runtime_str.strip()
    if runtime_str.endswith(' ns'):
        return float(runtime_str.replace(' ns', '')) / 1_000_000
    elif runtime_str.endswith(' µs'):
        return float(runtime_str.replace(' µs', '')) / 1_000
    elif runtime_str.endswith(' ms'):
        return float(runtime_str.replace(' ms', ''))
    elif runtime_str.endswith(' s'):
        return float(runtime_str.replace(' s', '')) * 1_000
    else:
        return float(runtime_str)


def chart_to_base64(fig):
    # Saves a matplotlib figure to a PNG in memory and returns base64 string
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    plt.close(fig)
    return b64


def main():
    # Read CSV file path from command line argument
    csv_file = sys.argv[1]
    df = pd.read_csv(csv_file)

    # Convert runtime strings to numeric values in milliseconds
    df['Avg Runtime (ms)'] = df['Avg Runtime'].apply(parse_runtime_to_ms)
    df['Min Runtime (ms)'] = df['Min Runtime'].apply(parse_runtime_to_ms)
    df['Max Runtime (ms)'] = df['Max Runtime'].apply(parse_runtime_to_ms)

    algorithms = df['Algorithm']
    x = np.arange(len(algorithms))
    bar_width = 0.5

    # Color palette
    colors = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

    charts = {}

    # Chart 1: Average Runtime with min/max error bars
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(x, df['Avg Runtime (ms)'], bar_width, color=colors[:len(algorithms)],
                  edgecolor='white', linewidth=0.8)
    yerr_lower = df['Avg Runtime (ms)'] - df['Min Runtime (ms)']
    yerr_upper = df['Max Runtime (ms)'] - df['Avg Runtime (ms)']
    ax.errorbar(x, df['Avg Runtime (ms)'], yerr=[yerr_lower, yerr_upper],
                fmt='none', capsize=5, color='#374151', capthick=1.5)
    ax.set_xlabel('Algorithm', fontsize=12, fontweight='bold')
    ax.set_ylabel('Runtime (ms)', fontsize=12, fontweight='bold')
    ax.set_title('Average Runtime Comparison', fontsize=16, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(algorithms, rotation=15, ha='right')
    ax.grid(axis='y', alpha=0.3)
    ax.set_axisbelow(True)
    for bar in bars:
        height = bar.get_height()
        if height == 0:
            label = '0.00'
        elif height < 0.0001:
            label = f'{height:.6f}'
        elif height < 0.01:
            label = f'{height:.4f}'
        elif height < 0.1:
            label = f'{height:.3f}'
        else:
            label = f'{height:.2f}'
            
        ax.annotate(label,
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 5), textcoords="offset points",
                    ha='center', va='bottom', fontsize=9)
    charts['runtime'] = chart_to_base64(fig)

    # Chart 2: Number of Comparisons
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(x, df['Comparisons'], bar_width, color=colors[:len(algorithms)],
                  edgecolor='white', linewidth=0.8)
    ax.set_xlabel('Algorithm', fontsize=12, fontweight='bold')
    ax.set_ylabel('Comparisons', fontsize=12, fontweight='bold')
    ax.set_title('Number of Comparisons', fontsize=16, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(algorithms, rotation=15, ha='right')
    ax.grid(axis='y', alpha=0.3)
    ax.set_axisbelow(True)
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{int(height):,}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 5), textcoords="offset points",
                    ha='center', va='bottom', fontsize=9)
    charts['comparisons'] = chart_to_base64(fig)

    # Chart 3: Number of Interchanges (Swaps)
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(x, df['Interchanges'], bar_width, color=colors[:len(algorithms)],
                  edgecolor='white', linewidth=0.8)
    ax.set_xlabel('Algorithm', fontsize=12, fontweight='bold')
    ax.set_ylabel('Interchanges', fontsize=12, fontweight='bold')
    ax.set_title('Number of Interchanges (Swaps)', fontsize=16, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(algorithms, rotation=15, ha='right')
    ax.grid(axis='y', alpha=0.3)
    ax.set_axisbelow(True)
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{int(height):,}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 5), textcoords="offset points",
                    ha='center', va='bottom', fontsize=9)
    charts['interchanges'] = chart_to_base64(fig)

    # Output JSON with base64-encoded chart images to stdout
    print(json.dumps(charts))


if __name__ == '__main__':
    main()
