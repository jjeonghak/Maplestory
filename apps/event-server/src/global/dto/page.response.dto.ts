export class PageResponseDto {
  pageNumber: number;
  pageSize: number;
  total: number;
  content: any[];

  public static of(pageNumber: number, pageSize: number, total: number, content: any[]) {
    const page = new PageResponseDto();
    page.pageNumber = pageNumber;
    page.pageSize = pageSize;
    page.total = total;
    page.content = content ? content : [];
    return page;
  }
}