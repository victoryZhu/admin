package com.yourhealth.security.controller;
 
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.yourhealth.common.service.ChbcUtils;
import com.yourhealth.foundation.domain.JqGridSearchCondition;
import com.yourhealth.foundation.domain.JqgridDataModel;
import com.yourhealth.foundation.domain.SpecificationByJqgridFilters;
import com.yourhealth.foundation.domain.JqGridSearchCondition.CallBack;
import com.yourhealth.foundation.ui.ReportCell;
import com.yourhealth.security.domain.SysLog;
import com.yourhealth.security.report.SyslogExcelView;
import com.yourhealth.security.report.SyslogPdfView;
import com.yourhealth.security.service.SysLogService;

@Controller
@RequestMapping("/security/syslog")
public class SyslogController {
	
	@Autowired
	private SysLogService syslogService = null;
	@Autowired
	private ChbcUtils chbcUtils;

	/**
	 * 主框架
	 * @return
	 */
	@RequestMapping(method = RequestMethod.GET)
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	public String main() {
		return "security/syslog/main";
	}
	
	/**
	 * 返回系统日志，json格式
	 * @param page
	 * @param rows
	 * @param sortBy
	 * @param order
	 * @param search
	 * @param filters
	 * @return
	 * @throws Exception 
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	@RequestMapping(value = "/list", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody	
	public JqgridDataModel<SysLog> getDataDics(
			Pageable pageable,
			@RequestParam(value = "sidx", defaultValue = "id", required = false) String sidx,
			@RequestParam(value = "sord", defaultValue = "desc", required = false) String sord,
			@RequestParam("_search") boolean search,
			@RequestParam(value = "filters", required = false) String filters) throws Exception {
		
		//
		PageRequest pageRequest = (PageRequest) pageable.previousOrFirst();			
		if (!sidx.equals("") && !sord.equals("")) {
			Sort sort = chbcUtils.getSortBySidxAndSord(sidx, sord);
			pageRequest = new PageRequest(pageRequest.getPageNumber(), pageRequest.getPageSize(), sort);
		}
		
		Specification<SysLog> spec = null;		
		if (search && filters != null) {			
			spec = new SpecificationByJqgridFilters<>(filters);
		}
		
		return new JqgridDataModel<>(syslogService.querySysLogLists(spec, pageRequest));
	}	
   
    /**
     * 导出pdf或excel
     * @param request
     * @param response
     * @param page
     * @param rows
     * @param sortBy
     * @param order
     * @param oper excel或者pdf
     * @param search
     * @param filters
     * @return
     * @throws Exception 
     */
    @RequestMapping("/export")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
    public ModelAndView export(HttpServletRequest request,HttpServletResponse response,
    		Pageable pageable,
			@RequestParam(value = "sidx", defaultValue = "id", required = false) String sidx,
			@RequestParam(value = "sord", defaultValue = "desc", required = false) String sord,
			@RequestParam(value = "oper", required = false) String oper,			
			@RequestParam("_search") boolean search,
			@RequestParam(value = "filters", required = false) String filters) throws Exception{     	
    	if("excel".equals(oper)){
    		return new ModelAndView(new SyslogExcelView(), getModel(pageable, sidx, sord, search, filters));
    	}else{
    		return new ModelAndView(new SyslogPdfView(), getModel(pageable, sidx, sord, search, filters));
    	}    	
    }
    
    /**
     * 生成列表抬头、列表数据和标题，用于生成Pdf和Excel
     * @param pageInfo
     * @return
     * @throws Exception 
     */
    private Map<String, Object> getModel(Pageable pageable, String sidx, String sord, boolean search, String filters) throws Exception{ 
    	
    	//
		PageRequest pageRequest = (PageRequest) pageable.previousOrFirst();	
		if (!sidx.equals("") && !sord.equals("")) {
			Sort sort = chbcUtils.getSortBySidxAndSord(sidx, sord);
			pageRequest = new PageRequest(pageRequest.getPageNumber(), pageRequest.getPageSize(), sort);
		}	
		
		Specification<SysLog> spec = null;		
		if (search && filters != null) {			
			spec = new SpecificationByJqgridFilters<>(filters);
		}
    	
    	List<SysLog> listSyslogs = syslogService.querySysLogLists(spec, pageRequest).getContent();    	    	   	
    	    	
    	//列名：时间、操作、用户名、用户部门、姓名、IP地址
    	List<ReportCell> columnlist=new ArrayList<ReportCell>();  
    	ReportCell cell=new ReportCell("ryxx.bmxx.bmmc", "部门", 1);
    	columnlist.add(cell);
    	cell=new ReportCell("ryxx.name", "姓名", 1);
    	columnlist.add(cell);
    	cell=new ReportCell("ryxx.username", "用户名", 1);
    	columnlist.add(cell);    	
    	cell=new ReportCell("opeType", "操作类型", 1);
    	columnlist.add(cell);
    	cell=new ReportCell("opeTime", "操作时间", 2, "Calendar", "yyyy-MM-dd HH:mm:ss"); //   	
    	columnlist.add(cell);    	
    	cell=new ReportCell("ip", "IP地址", 2);
    	columnlist.add(cell);
    	
    	Map<String, Object> model=new HashMap<String, Object>();
    	model.put("list", listSyslogs);
    	model.put("columnlist", columnlist);
    	model.put("reportname", "系统日志"); //系统日志
    	return model;
    }
    
    /**
     * 自定义查询处理接口，对于操作日期字段条件的查询进行特别处理，增加date方法
     * @author zzm
     *
     */
  	public class SyslogCallBack implements CallBack{

  		@Override
  		public String executeQuery(String f, String o, String d) {
  			if("d.opeTime".equals(f)){
  				return JqGridSearchCondition.processOperater("date("+f+")", o, d);
  			}else{
  				return JqGridSearchCondition.processOperater(f, o, d);
  			}			
  		}
  		
  	}
    
}