import { Component, OnInit, inject } from '@angular/core';
import { Article } from '../article/article';
import { Paragraph } from '../paragraph/paragraph';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';
import { D3Chart } from '../d3-chart/d3-chart';
import { DataService, BudgetItem } from '../services/data.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'pb-homepage',
  imports: [Article, Paragraph, Breadcrumbs, D3Chart],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss'
})

export class Homepage implements OnInit {
  private dataService = inject(DataService);
  private chart: Chart | undefined;
  public budgetData: BudgetItem[] = [];
  
  public dataSource = {
                datasets: [
                    {
                        data: [] as number[],
                        backgroundColor: [
                            '#ffcd56',
                            '#ff6384',
                            '#36a2eb',
                            '#fd6b19',
                        ]
                    }
                ],
                labels: [] as string[]
            };

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.getBudget();
  }

  getBudget() {
    this.dataService.getBudgetData().subscribe((budgetData: BudgetItem[]) => {
      // Clear existing data
      this.budgetData = [];
      this.dataSource.datasets[0].data = [];
      this.dataSource.labels = [];
      
      for (var i = 0; i < budgetData.length; i++) {
        this.dataSource.datasets[0].data[i] = budgetData[i].budget;
        this.dataSource.labels[i] = budgetData[i].title;
        
        // Populate budgetData for D3Chart
        this.budgetData.push({
          title: budgetData[i].title,
          budget: budgetData[i].budget
        });
      }
      this.createChart();
    });
  }

  private createChart() {
      var ctx = document.getElementById('myChart') as HTMLCanvasElement;
      if (ctx) {
          // Destroy existing chart if it exists
          if (this.chart) {
              this.chart.destroy();
          }
          
          this.chart = new Chart(ctx, {
              type: 'pie',
              data: this.dataSource,
          });
      }
  }
}
