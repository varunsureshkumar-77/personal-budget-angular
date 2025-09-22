import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { BudgetItem } from '../services/data.service';
import * as d3 from 'd3';

@Component({
  selector: 'pb-d3-chart',
  standalone: true,
  imports: [],
  templateUrl: './d3-chart.html',
  styleUrl: './d3-chart.scss'
})
export class D3Chart implements OnInit, OnDestroy, OnChanges {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() data: BudgetItem[] = [];

  private svg: any;
  private margin = { top: 20, right: 90, bottom: 60, left: 90 };
  private width = 400 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  private radius = Math.min(this.width, this.height) / 2;
  private colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  ngOnInit() {
    this.createSvg();
    // If data is already available, update the chart
    if (this.data && this.data.length > 0) {
      this.updateChart();
      this.updateLegend();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data && this.data.length > 0) {
      console.log('D3Chart: Data received:', this.data);
      this.updateChart();
      this.updateLegend();
    }
  }

  ngOnDestroy() {
    if (this.svg) {
      this.svg.remove();
    }
  }

  private createSvg(): void {
    const container = d3.select(this.chartContainer.nativeElement);
    container.selectAll('*').remove();
    
    this.createLegend(container);
    
    this.svg = container
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.width / 2 + this.margin.left}, ${this.height / 2 + this.margin.top})`);

    this.svg.append('g').attr('class', 'slices');
    this.svg.append('g').attr('class', 'labels');
  }

  private createLegend(container: any): void {
    container
      .append('div')
      .attr('class', 'legend-container')
      .style('display', 'flex')
      .style('flex-wrap', 'wrap')
      .style('justify-content', 'center')
      .style('margin-bottom', '20px')
      .style('gap', '15px');
  }

  private updateLegend(): void {
    if (!this.data || this.data.length === 0) return;

    const legendContainer = d3.select(this.chartContainer.nativeElement).select('.legend-container');
    legendContainer.selectAll('.legend-item').remove();

    const legendItems = legendContainer.selectAll('.legend-item')
      .data(this.data)
      .enter()
      .append('div')
      .attr('class', 'legend-item')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('font-size', '12px')
      .style('color', '#333');

    legendItems.append('div')
      .style('width', '12px')
      .style('height', '12px')
      .style('border-radius', '50%')
      .style('margin-right', '5px')
      .style('background-color', (_: any, i: number) => this.colors[i % this.colors.length]);

    legendItems.append('span')
      .text((d: any) => `${d.title}: $${d.budget}`);
  }

  private updateChart(): void {
    if (!this.data || this.data.length === 0) {
      console.log('D3Chart: No data available');
      return;
    }

    console.log('D3Chart: Updating chart with data:', this.data);
    console.log('D3Chart: SVG element:', this.svg);

    const pie = d3.pie<BudgetItem>()
      .sort(null)
      .value(d => d.budget);

    const arc = d3.arc<any>()
      .outerRadius(this.radius * 0.8)
      .innerRadius(this.radius * 0.4);

    const arcs = pie(this.data);
    console.log('D3Chart: Generated arcs:', arcs);

    // DATA JOIN
    const slice = this.svg.select('.slices').selectAll('path.slice')
      .data(arcs);

    // ENTER new slices
    slice.enter()
      .insert('path')
      .attr('class', 'slice')
      .style('fill', (_: any, i: number) => this.colors[i % this.colors.length])
      .attr('d', arc) // Set initial path immediately
      .style('opacity', 0)
      .transition()
      .duration(750)
      .style('opacity', 1);

    // UPDATE existing slices
    slice.transition()
      .duration(750)
      .attr('d', arc);

    // EXIT removed slices
    slice.exit()
      .transition()
      .duration(750)
      .style('opacity', 0)
      .remove();

    // TEXT LABELS
    const text = this.svg.select('.labels').selectAll('text')
      .data(arcs);

    text.enter()
      .append('text')
      .attr('class', 'label-text')
      .attr('dy', '.35em')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .style('text-anchor', 'middle')
      .text((d: any) => `$${d.data.budget}`)
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .style('opacity', 0)
      .transition()
      .duration(750)
      .style('opacity', 1);

    text.transition()
      .duration(750)
      .text((d: any) => `$${d.data.budget}`)
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`);

    text.exit()
      .transition()
      .duration(750)
      .style('opacity', 0)
      .remove();
  }
}
