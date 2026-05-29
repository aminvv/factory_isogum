import { Component } from '@angular/core';

@Component({
  selector: 'app-blog-section',
  templateUrl: './blog-section.component.html',
  styleUrls: ['./blog-section.component.css'],
})
export class BlogSectionComponent {
  posts = [
    {
      img: 'https://picsum.photos/id/1018/600/400',
      tag: 'BLOG',
      day: '30',
      month: 'Sept',
      title: 'Nulla vehicula porttitor lorem',
      excerpt: 'Curabitur sagittis mauris ex, non congue enim sagittis et...',
      link: '#'
    },
    {
      img: 'https://picsum.photos/id/1024/600/400',
      tag: 'NEWS',
      day: '18',
      month: 'Aug',
      title: 'In quis neque sed velit sodales interdum',
      excerpt: 'Sed id turpis auctor, vulputate turpis fringilla, volutpat mi...',
      link: '#'
    },
    {
      img: 'https://picsum.photos/id/1024/600/400',
      tag: 'NEWS',
      day: '18',
      month: 'Aug',
      title: 'In quis neque sed velit sodales interdum',
      excerpt: 'Sed id turpis auctor, vulputate turpis fringilla, volutpat mi...',
      link: '#'
    },
    {
      img: 'https://picsum.photos/id/1024/600/400',
      tag: 'NEWS',
      day: '18',
      month: 'Aug',
      title: 'In quis neque sed velit sodales interdum',
      excerpt: 'Sed id turpis auctor, vulputate turpis fringilla, volutpat mi...',
      link: '#'
    },
    {
      img: 'https://picsum.photos/id/1027/600/400',
      tag: 'BLOG',
      day: '09',
      month: 'Aug',
      title: 'Sed a nulla a felis imperdiet vestibulum',
      excerpt: 'Donec blandit vestibulum ipsum, eu viverra purus tempus at...',
      link: '#'
    }
  ];
}
