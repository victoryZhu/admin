package com.yourhealth.common.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.dom4j.DocumentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody; 

import com.yourhealth.common.domain.SelectGrid;
import com.yourhealth.common.domain.SelectObject;
import com.yourhealth.common.service.ChbcUtils;
import com.yourhealth.common.service.SelectService;
import com.yourhealth.foundation.domain.JqGridSearchCondition;

/**
 * 通用选取控制类
 * @author zzm
 *
 */
@Controller
@RequestMapping("/common/select")
public class SelectController {
	
	@Autowired
	private SelectService selectService;
	@Autowired
	private ChbcUtils chbcUtils;
			
	/**
	 * 
	 * @param response
	 * @param systemId  系统id
	 * @param id             通用选取文件中选取对象的id
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/object/{systemId}/{id}", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody  
	public SelectObject getSelectObject(HttpServletResponse response,
			@PathVariable String systemId,
			@PathVariable String id
			) throws Exception{
		
		SelectObject aSelectObject;
		try {
			aSelectObject = selectService.getSelectObject(systemId, id);
			return aSelectObject;	
		} catch (IOException e1) {
			e1.printStackTrace();
			//throw new RuntimeException("通用选取配置文件不存在");
			response.setContentType("text/html;charset=UTF-8"); 
			response.setStatus(500);
			PrintWriter writer = response.getWriter();   
		    writer.write("通用选取配置文件不存在" );   
		    writer.flush();
		} catch (DocumentException e1) {
			e1.printStackTrace();
			//throw new RuntimeException("通用选取配置文件读取异常");
			response.setContentType("text/html;charset=UTF-8");  
			response.setStatus(500);
			PrintWriter writer = response.getWriter();   
		    writer.write("通用选取配置文件读取异常");   
		    writer.flush();
		}	
		return null;
	}  
	
	/**
	 * 得到通用选取分页数据list
	 * @param page
	 * @param rows
	 * @param orderName
	 * @param orderType
	 * @param search
	 * @param filters
	 * @param oldCndt
	 * @param objectName
	 * @param listNames
	 * @return
	 */
	@RequestMapping(value = "/listdata", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody  //返回json格式数据的方式
	public SelectGrid getJgxxGrid( 		
		Pageable pageable,
		@RequestParam(value = "sidx", defaultValue = "id", required = false) String sidx,  //排序字段
		@RequestParam(value = "sord", defaultValue = "desc", required = false) String sord,  //排序方式
		@RequestParam("_search") boolean search,		//是否查询
		@RequestParam(value="filters",required=false)String filters,  //用户查询条件		
		@RequestParam(value="oldCndt",required=false)String oldCndt,  //系统查询条件
		@RequestParam(value="objectName",required=true)String objectName,//数据从此表中获取
		@RequestParam(value="listNames[]",required=true)String[] listNames//需获取这些列
		 ) {		
		//
		PageRequest pageRequest = (PageRequest) pageable.previousOrFirst();	
		
		if (!sidx.equals("") && !sord.equals("")) {
			Sort sort = chbcUtils.getSortBySidxAndSord(sidx, sord);
			pageRequest = new PageRequest(pageRequest.getPageNumber(), pageRequest.getPageSize(), sort);
		}
		
		//查询条件
		StringBuffer condition = new StringBuffer(" where 1=1 ");
		if (oldCndt != null && !oldCndt.equals("")){
			condition.append( " and " +oldCndt);
		}
		
		if(search){
			String jqgridCondition;
			try {
				jqgridCondition = JqGridSearchCondition.processSql("d", filters, null);				 
				condition.append(jqgridCondition);
			} catch (Exception e) { 
				e.printStackTrace();
			}			
		}		
	
		Page<Map<String, String>> data = selectService.selectDataLists(objectName, listNames, pageRequest, condition.toString());
		
		SelectGrid ret = new SelectGrid();

		ret.setRecords(data.getTotalElements());
		ret.setPage(data.getNumber() + 1);
		ret.setTotal((long) data.getTotalPages());
		ret.setRows(data.getContent());
		
		return ret;		
	}

}
